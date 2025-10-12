#!/usr/bin/env python3
import json, sys
from joblib import load
from scipy.sparse import hstack
word = load(r"symptoms/model/tfidf_word.joblib")
char = load(r"symptoms/model/tfidf_char.joblib")
clf = load(r"symptoms/model/sgd_softmax_best.joblib")
with open(r"symptoms/model/label_map.json") as f:
    label_map = json.load(f)
def predict_topk(text, k=5):
    X = hstack([word.transform([text]), char.transform([text])], format='csr')
    p = clf.predict_proba(X)[0]
    idxs = p.argsort()[::-1][:k]
    return [(int(label_map[i]), float(p[i])) for i in idxs]
if __name__ == "__main__":
    txt = " ".join(sys.argv[1:]) or "pelvic pressure and heavy flow"
    print(predict_topk(txt, k=5))
