from app.core.logging import logger
from app.db.base import Base, engine
# models must be imported so Base.metadata knows about them
from app.models.user import User  # noqa: F401
from app.models.prediction import Prediction  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured.")
