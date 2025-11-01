from transformers import DistilBertForSequenceClassification, DistilBertTokenizerFast
import torch
import pandas as pd

MODEL = None
TOKENIZER = None
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
THRESHOLD = 0.1

def init_model(model_path: str):
    global MODEL, TOKENIZER
    MODEL = DistilBertForSequenceClassification.from_pretrained(model_path)
    TOKENIZER = DistilBertTokenizerFast.from_pretrained(model_path)
    MODEL.to(DEVICE)
    MODEL.eval()
    print(f"Model loaded on {DEVICE} from {model_path}")


def predict(emails: pd.DataFrame, threshold: float = 0.1):
    if MODEL is None or TOKENIZER is None:
        raise RuntimeError("Model not initialized. Call init_model() first.")
    
    
    texts = emails['body'].fillna("").astype('string').tolist()
    texts = [text[:200] for text in texts]  # Truncate to 200 characters (like training)
    
    inputs = TOKENIZER(
        texts, padding=True, truncation=True, return_tensors="pt"
    ).to(DEVICE)
    
    with torch.no_grad():
        logits = MODEL(**inputs).logits
        probs = torch.softmax(logits, dim=1)[:, 1].cpu()  
        
    del inputs, logits
    torch.cuda.empty_cache() if torch.cuda.is_available() else None
    
    new_df = emails.copy()
    new_df['job_probability'] = probs.tolist()
    new_df['prediction'] = (new_df['job_probability'] >= threshold).astype(int)
    return new_df
