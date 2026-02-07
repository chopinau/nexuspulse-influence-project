import os
import json
import time
from typing import Dict, Any, Optional

# Simple file-based cache to avoid DB complexity for MVP
CACHE_FILE = "python_backend/memory_cache.json"

def load_memory() -> Dict[str, Any]:
    if not os.path.exists(CACHE_FILE):
        return {}
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_memory(memory: Dict[str, Any]):
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(memory, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Memory Save Error: {e}")

def check_cache(topic: str) -> Optional[Dict[str, Any]]:
    """Checks if a valid cache exists for the topic (24h TTL)."""
    memory = load_memory()
    if topic in memory:
        entry = memory[topic]
        # Check TTL (24 hours = 86400 seconds)
        if time.time() - entry.get("timestamp", 0) < 86400:
            return entry["data"]
    return None

def store_intel(topic: str, data: Dict[str, Any], mode: str = "GENERAL"):
    """Stores the generated report into the memory engine."""
    memory = load_memory()
    memory[topic] = {
        "timestamp": time.time(),
        "mode": mode,
        "data": data
    }
    save_memory(memory)
