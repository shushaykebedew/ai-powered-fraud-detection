import logging
import sys


def setup_logging(level: str = "INFO") -> None:
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )
    # keep noisy libraries quieter than app logs
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


logger = logging.getLogger("fraud_detection")
