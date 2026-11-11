from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def log_registration(email: str) -> None:
    """
    Background task to log successful user registration.
    """
    timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    logger.info(
        "Timestamp: %s | Email: %s | Registration successful",
        timestamp,
        email,
    )