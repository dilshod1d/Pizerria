import json
from pathlib import Path

base_dir = Path(__file__).resolve().parent.parent

MENU = json.loads((base_dir / "data/menu.json").read_text())
