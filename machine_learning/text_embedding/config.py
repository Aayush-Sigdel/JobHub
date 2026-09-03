MODEL_NAME = "allenai/longformer-base-4096"
EMBEDDING_DIM = 256
DEFAULT_DATASET = "med2425/resume-job-fit-merged-v1"

DEFAULT_MAX_LENGTH = 2048

LABEL_SCORES = {
    "No Fit": 0.0,
    "Potential Fit": 0.5,
    "Good Fit": 1.0,
}
