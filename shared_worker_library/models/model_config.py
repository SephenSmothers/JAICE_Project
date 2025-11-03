# model configuration
MODEL_NAME = "MoritzLaurer/deberta-v3-large-zeroshot-v2.0"

# classification labels for application stages
CLASSIFICATION_LABELS = [
    "applied",
    "interview",
    "offer",
    "accepted",
    "rejected"
]

# batch size for processing emails
BATCH_SIZE = 1

# confidence threshold for classification
CONFIDENCE_THRESHOLD = 0.6