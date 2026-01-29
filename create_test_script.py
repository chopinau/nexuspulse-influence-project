import os

path = r"D:\my-web-app\BettaFish\test_supabase_insert.py"
content = r'''# -*- coding: utf-8 -*-
import os
import sys
from datetime import datetime
import requests
from dotenv import load_dotenv

# Load env from .env file
load_dotenv()

def save_to_supabase(title: str, content: str):
    print("\n" + "=" * 70)
    print("Testing: Saving to Supabase DB")
    print("=" * 70)
    
    url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_KEY")
    
    if not url or not key:
        print("❌ Missing Supabase config (SUPABASE_URL or SUPABASE_KEY)")
        return
        
    try:
        print(f"Connecting to Supabase: {url}")
        
        api_url = f"{url}/rest/v1/market_news"
        headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        
        data = {
            "title": title,
            "content": content,
            "created_at": datetime.now().isoformat()
        }
        
        response = requests.post(api_url, headers=headers, json=data)
        
        if response.status_code in [200, 201]:
            print(f"✓ Data successfully inserted into market_news table")
        else:
            print(f"❌ Save failed: {response.status_code} - {response.text}")
        
    except Exception as e:
        print(f"❌ Failed to save to Supabase: {e}")

if __name__ == "__main__":
    save_to_supabase(
        "Elon Musk and Tesla latest market news (Test)", 
        "# Intelligence Report\n\n**Source:** System Test\n\n**Status:** Verified Connection.\n\nThis is a test entry to confirm that the frontend can display data from Supabase.\n\n- **Tesla Stock:** Stable\n- **SpaceX:** Launch scheduled\n- **Twitter/X:** Algorithm update"
    )
'''

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Created {path}")
