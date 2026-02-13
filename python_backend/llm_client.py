import os
import sys
import json
import requests
from dotenv import load_dotenv

# Setup
current_file_path = os.path.abspath(__file__)
python_backend_dir = os.path.dirname(current_file_path)
project_root_dir = os.path.dirname(python_backend_dir)
load_dotenv(os.path.join(project_root_dir, '.env'))

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY") or os.getenv("GEMINI_API_KEY")

# ==========================================
# LLM CLIENT
# ==========================================
def call_llm(user_prompt, system_prompt=None, response_format=None):
    if not DEEPSEEK_API_KEY:
        print("❌ No API Key found")
        return "{}" if response_format == "json" else "Error: No API Key"

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_prompt})

    payload = {
        "model": "deepseek-chat",
        "messages": messages,
        "temperature": 0.1,
        "stream": False
    }
    
    # DeepSeek V3 supports response_format={'type': 'json_object'}
    if response_format == "json":
        payload["response_format"] = {"type": "json_object"}

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        print(f"🤖 Calling LLM...")
        response = requests.post("https://api.deepseek.com/chat/completions", json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        print(f"✅ LLM Response: {content[:100]}...")
        return content
    except Exception as e:
        print(f"❌ LLM Call Failed: {e}")
        return "{}" if response_format == "json" else str(e)