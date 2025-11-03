from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification

model_name = "MoritzLaurer/deberta-v3-large-zeroshot-v2.0"

_model = None
_tokenizer = None
_classifier = None

# run the model when it is being used
def get_classifier():
    """Lazy load the classifier to avoid loading at import time."""
    global _model, _tokenizer, _classifier
    
    if _classifier is None:
        print(f"Loading classification model: {model_name}")
        
        _model = AutoModelForSequenceClassification.from_pretrained(model_name)
        _tokenizer = AutoTokenizer.from_pretrained(model_name)
        _classifier = pipeline("zero-shot-classification", model=_model, tokenizer=_tokenizer)

        print("Classification model loaded successfully")
    
    return _classifier