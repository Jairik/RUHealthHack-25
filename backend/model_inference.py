import json
import pandas as pd
from pathlib import Path
from typing import List, Tuple, Union
import numpy as np
from joblib import load, dump
from scipy.sparse import hstack

class ConditionSoftmaxPredictor:
    """
    Loads artifacts saved by train_softmax_classifier_classwise(...)
    and provides softmax probabilities for new text.
    Expected files in model_dir:
      - sgd_softmax_best.joblib
      - tfidf_word.joblib
      - tfidf_char.joblib  (optional; handled if missing)
      - label_map.json     (list of original condition_IDs, ordered by class index)
    """

    def __init__(self, model_dir: Union[str, Path]):
        model_dir = Path(model_dir)
        self.model = load(model_dir / "sgd_softmax_best.joblib")
        self.v_word = load(model_dir / "tfidf_word.joblib")
        # char vectorizer might be absent if you trained word-only
        char_path = model_dir / "tfidf_char.joblib"
        self.v_char = load(char_path) if char_path.exists() else None

        with (model_dir / "label_map.json").open() as f:
            self.label_map: List[int] = json.load(f)  # index -> condition_ID
        self.n_classes = len(self.label_map)

    def _vectorize(self, texts: List[str]):
        Xw = self.v_word.transform(texts)
        if self.v_char is not None:
            Xc = self.v_char.transform(texts)
            return hstack([Xw, Xc], format="csr")
        return Xw

    def predict_proba(self, texts: Union[str, List[str]]) -> np.ndarray:
        """
        Returns softmax probabilities with shape (n_samples, n_classes).
        Each row sums to ~1.0.
        """
        if isinstance(texts, str):
            texts = [texts]
        X = self._vectorize(texts)
        proba = self.model.predict_proba(X)
        return proba

    def topk(self, text: str, k: int = 10) -> List[Tuple[int, float]]:
        """
        Returns the top-k (condition_ID, probability) pairs for a single text.
        """
        p = self.predict_proba(text)[0]
        idxs = np.argsort(p)[::-1][:k]
        return [(int(self.label_map[i]), float(p[i])) for i in idxs]

# ---- convenience wrapper ----
def load_and_predict_softmax(model_dir: Union[str, Path], user_input: str, k: int = 6):
    """
    Loads the model and returns:
      - 'probs': full softmax vector as a numpy array (classes ordered by label_map)
      - 'topk': list of (condition_ID, probability) for the top-k classes
      - 'label_map': the ordered condition_ID list (index -> condition_ID)
    """
    predictor = ConditionSoftmaxPredictor(model_dir)
    probs = predictor.predict_proba(user_input)[0]
    return {
        "probs": probs,                          # np.ndarray of length n_classes
        "topk": predictor.topk(user_input, k=k), # [(condition_ID, prob), ...]
        "label_map": predictor.label_map         # index -> condition_ID
    }


def power_transform(
    arr,
    alpha   :   float   =   5
):
    t_sum = 0
    for i in range(len(arr)):
        t_sum += arr[i] ** alpha
    
    out = np.zeros(len(arr), dtype=np.float32)

    for i in range(len(out)):
        out[i] = arr[i] ** alpha / t_sum

    return out
    
def inference(
    user_text = "", 
    first_call=False,
    last_ans=-1
):
    model_dir = "./model"

    if(first_call):
        dump("",'./model/work.str')
        dump([],'./model/null.idx')
        dump([],'./model/sclr.idx')
        dump([],'./model/dont.ask')
        dump(-1,'./model/last.qid')

    work_str = load('./model/work.str')
    work_str += user_text
    
    null_idx = load('./model/null.idx')
    sclr_idx = load('./model/sclr.idx')
    dont_ask = load('./model/dont.ask')
    last_qid = load('./model/last.qid')

    out = load_and_predict_softmax(model_dir, work_str, k=6)
    
    #for saving progress, need to collect
    #null.idx variable from long term storage
    #sclr.idx variable from long term storage
    #these variables is reinitialized upon first_call and appends once per NO/FALSE on question

    #print(f"loaded last_qid: {last_qid}")

    sspec_full = pd.read_csv('./data/symptoms_full.csv').values[:, 1:3]
    sspec_map = sspec_full[:, 0].astype(np.int64)
    cond_map = sspec_full[:, 1]

    if(last_qid>-1):
        if(last_ans==1):
            #here for inference and dump
            sclr_idx.append(last_qid)
            dont_ask.append(last_qid)

        elif(last_ans==0):
            #here for inference and dump
            null_idx.append(last_qid)
            dont_ask.append(last_qid)

        else:
            #pass question case!! should be absolutely no change
            dont_ask.append(last_qid)

    if(len(sclr_idx)>0):
        #here for inference
        sclr_vals = pd.read_csv('./data/symptoms_full.csv').values[sclr_idx, 9].astype(np.float32)
        out['probs'][sclr_idx] *= sclr_vals

    if(len(null_idx)>0):
        #nullify invalid ones
        out['probs'][null_idx] = 0
    
    if(len(null_idx)+len(sclr_idx)>0):
        #need to renormalize to sum one
        out['probs'] = out['probs']/np.sum(out['probs'])


    #need to dump updated values
    dump(null_idx,'./model/null.idx')
    dump(sclr_idx,'./model/sclr.idx')
    dump(dont_ask,'./model/dont.ask')
    dump(work_str,'./model/work.str')

    #need to solve for highest proba outside strongest sspec aggregation        
    #mean_by_sspec = np.bincount(sspec_map, weights=out["probs"])
    #print(mean_by_sspec)

    if(first_call==False):
        probs  = np.asarray(out["probs"], dtype=float)         # shape (N,)
        labels = np.asarray(sspec_map)                         # shape (N,)
        # Factorize labels (works for int/str/object; contiguous 0..U-1 codes)
        uniq, inv = np.unique(labels, return_inverse=True)     # inv: shape (N,), ints
        # 1) Sum probs per aggregation (group)
        group_sums = np.bincount(inv, weights=probs)           # shape (U,)
        best_group_code = int(np.argmax(group_sums))           # the highest-scoring aggregation
        # 2) Build mask: NOT in best group, and NOT in dont_ask
        N = probs.shape[0]
        mask = (inv != best_group_code)
        dont_ask = np.asarray(dont_ask, dtype=np.intp)
        dont_ask = dont_ask[(dont_ask >= 0) & (dont_ask < N)]  # safety against OOB
        mask[dont_ask] = False
        # Option A: single pass (fill excluded with -inf)
        next_qid = int(np.argmax(np.where(mask, probs, -np.inf)))
        #then we will call
        dump(next_qid, './model/last.qid')

        question = pd.read_csv('./data/symptoms_full.csv').values[next_qid, 8]
    
    else:
        question = 'Q_INIT'

    #to solve for best question we need to group condition probabilities into subspecialties 
    #then we need to find the highest probability not in most confident aggregation

    topk_cond = [{"condition":cond_map[i[0]],"condition_results":round(i[1], 4)} for i in out['topk']]

    doc_map = pd.read_csv('./data/cond_doc_map.csv').values

    doc_names = pd.read_csv('./data/doc_sspec_map.csv').values

    doc_mapper = out['probs'][doc_map[:, 0]]


    doc_prod = doc_map[:, 1:] * doc_mapper[:, None]
    doc_sum = np.log(np.sum(doc_prod, axis=0)+1)

    e_trans_doc = doc_sum / np.sum(doc_sum)
    p_trans_doc = power_transform(e_trans_doc, alpha=0.5)

    doc_order_idx = np.argsort(-p_trans_doc)[:6]

    doc_results = np.empty(6, dtype=dict)

    doc_results = {
        "Best Match":doc_names[doc_order_idx[0],1],
        "Second Match":doc_names[doc_order_idx[1],1],
        "Third Match":doc_names[doc_order_idx[2],1]
    }

    sspec_sum = np.zeros(6, dtype=np.float32)

    for i in range(sspec_map.shape[0]):
        sspec_sum[sspec_map[i]] += out['probs'][i]

    p_trans_sums = power_transform(sspec_sum)

    sspecs = pd.read_csv('./data/sspec_key_map.csv').values

    order_idx = np.argsort(-p_trans_sums)


    results = np.empty(len(p_trans_sums), dtype=dict)
    for i in range(len(p_trans_sums)):
        results[i] = {
            "rank":int(order_idx[i]+1),
            "subspecialty_name":sspecs[i,1],
            "subspecialty_short":sspecs[i,2],
            "percent_match":(round(float(p_trans_sums[i]), 4))
        }

    results = list(results[order_idx])
    
    ret = {
        "subspecialty_results": results,
        "doctor_results":doc_results,
        "condition_results":topk_cond,
        "question":question
    }

    return ret
