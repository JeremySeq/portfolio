import logging
from datetime import datetime

LOGGER_NAME = "portfolio"

class CustomFormatter(logging.Formatter):
    def formatTime(self, record, datefmt=None):
        return datetime.fromtimestamp(record.created).strftime("%Y-%m-%d %H:%M:%S")

    def format(self, record):
        if not hasattr(record, 'tag'):
            record.tag = "App"
        return super().format(record)

def get_app_logger(name=LOGGER_NAME):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    if not logger.hasHandlers():
        formatter = CustomFormatter("[%(asctime)s] [%(tag)s] [%(levelname)s]: %(message)s")
        handler = logging.StreamHandler()
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
