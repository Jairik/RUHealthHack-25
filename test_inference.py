from backend.model_inference import inference
import os
import traceback

try:
    print("Testing inference(first_call=True)...")
    res = inference(user_text="", first_call=True)
    print("Result:", res)
    
    print("Testing inference(answer)...")
    res2 = inference(user_text="I have a headache", first_call=False, last_ans=-1)
    print("Result 2:", res2)
    
    print("Success!")
except Exception:
    traceback.print_exc()
