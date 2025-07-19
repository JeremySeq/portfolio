import json
import os
import random

def generate_seeded_random(date_str):
    random.seed(date_str)

def generate_daily_puzzle(date_str):
    generate_seeded_random(date_str)

    size = 5
    grid = [[random.randint(1, 9) for _ in range(size)] for _ in range(size)]

    removed = [[random.random() < 0.4 for _ in range(size)] for _ in range(size)]

    row_sums = [sum(grid[r][c] for c in range(size) if not removed[r][c]) for r in range(size)]
    col_sums = [sum(grid[r][c] for r in range(size) if not removed[r][c]) for c in range(size)]

    return {
        "date": date_str,
        "grid": grid,
        "rowSums": row_sums,
        "colSums": col_sums
    }

def save_puzzle_to_file(puzzle, filename):
    with open(filename, "w") as f:
        json.dump(puzzle, f)

def load_puzzle_from_file(filename):
    if not os.path.exists(filename):
        return None
    with open(filename, "r") as f:
        return json.load(f)
