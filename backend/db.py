import os

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'db')

if not os.path.exists(DB_DIR):
    os.mkdir(DB_DIR)

