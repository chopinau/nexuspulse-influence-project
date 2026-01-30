# -*- coding: utf-8 -*-
"""
NexusPulse Report Engine - Level 1: Logic Clone (Standalone)
"Wall Street Intelligence Officer" Edition
Features:
- Dual-Source Search (Official News + Community Rumors)
- DeepSeek/Gemini Integration
- Hard Data Extraction + Street Whispers Analysis
- Direct Supabase Integration
"""

import os
import sys
import json
import time
import re
import argparse
import requests
import logging
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Optional

# Third-party imports
from dotenv import load_dotenv
from loguru import logger
from duckduckgo_search import DDGS
import trafilatura

# ================= Configuration & Setup =================

# Determine Paths
current_file_path = os.path.abspath(__file__)
python_backend_dir = os.path.dirname(current_file_path)
project_root_dir = os.path.dirname(python_backend_dir)

# Load Environment Variables
load_dotenv(os.path.join(project_root_dir, '.env'))

# API Keys
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("REPORT_ENGINE_API_KEY")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY")

# Constants
MAX_SEARCH_RESULTS = 5
MAX_SCRAPE_THREADS = 5
MAX_CONTENT_LENGTH = 15000  # Truncate combined text to avoid context overflow

# Configure Logging
logger.remove()
logger.add(sys.stderr, format="<green>{time:HH:mm:ss}</green> | <level>{message}</level>", level="INFO")

# ================= Core Functions =================

def search_web(topic: str, source_type: str) -> List[Dict]:
    """
    Execute search based on source type.
    Source A: Official News
    Source B: Community/Rumors
    """
    results = []
    query = ""
    
    if source_type == "official":
        query = f"{topic} latest news finance data"
        logger.info(f"🔍 [Source A] Searching Official News: {query}")
    elif source_type == "community":
        query = f"{topic} site:reddit.com OR site:twitter.com intitle:rumor OR intitle:leak"
        logger.info(f"🔍 [Source B] Searching Community Whispers: {query}")
    else:
        return []

    try:
        with DDGS() as ddgs:
            # Use 'news' backend for official, 'text' for community to capture forum posts
            if source_type == "official":
                ddgs_gen = ddgs.news(query, max_results=MAX_SEARCH_RESULTS)
            else:
                ddgs_gen = ddgs.text(query, max_results=MAX_SEARCH_RESULTS)
            
            for r in ddgs_gen:
                results.append({
                    "title": r.get("title", ""),
                    "url": r.get("href") or r.get("url", ""),
                    "source_type": source_type
                })
    except Exception as e:
        logger.error(f"❌ Search failed for {source_type}: {e}")
    
    logger.info(f"   ✅ Found {len(results)} links for {source_type}")
    return results

def scrape_url(url_data: Dict) -> Dict:
    """Scrape a single URL using Trafilatura"""
    url = url_data["url"]
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            text = trafilatura.extract(downloaded, include_comments=True, include_tables=True)
            if text:
                return {
                    "source": url_data["source_type"],
                    "url": url,
                    "content": text[:3000] # Limit per article
                }
    except Exception as e:
        pass # Ignore individual failures
    return None

def collect_intelligence(topic: str) -> str:
    """Parallel search and scrape workflow"""
    # 1. Search
    official_links = search_web(topic, "official")
    community_links = search_web(topic, "community")
    all_links = official_links + community_links
    
    if not all_links:
        logger.warning("⚠️ No search results found.")
        return ""

    # 2. Scrape in Parallel
    logger.info(f"🕷️ Scraping {len(all_links)} URLs...")
    scraped_data = []
    
    with ThreadPoolExecutor(max_workers=MAX_SCRAPE_THREADS) as executor:
        futures = [executor.submit(scrape_url, link) for link in all_links]
        for future in as_completed(futures):
            result = future.result()
            if result:
                scraped_data.append(result)
    
    logger.success(f"📦 Successfully scraped {len(scraped_data)} pages.")
    
    # 3. Format for LLM
    context_str = ""
    for item in scraped_data:
        context_str += f"\n--- SOURCE ({item['source']}): {item['url']} ---\n{item['content']}\n"
    
    return context_str[:MAX_CONTENT_LENGTH]

def analyze_with_llm(topic: str, context: str) -> Dict:
    """
    Call DeepSeek/Gemini to generate the report.
    Returns parsed JSON object with 'content', 'sentiment_score', etc.
    """
    if not DEEPSEEK_API_KEY:
        logger.error("❌ API Key missing. Cannot analyze.")
        return None

    logger.info("🧠 sending data to HQ (DeepSeek/Gemini)...")

    system_prompt = (
        "You are a Wall Street Hedge Fund Intelligence Officer. "
        "Your job is to analyze raw data and community rumors to provide actionable intelligence."
    )
    
    user_prompt = f"""
    TOPIC: {topic}
    
    RAW INTELLIGENCE DATA:
    {context}
    
    MISSION:
    Generate a specialized intelligence report in Markdown format.
    
    STRICT OUTPUT FORMAT REQUIREMENTS:
    
    1. **📊 Hard Data Panel**
       - Extract ALL concrete numbers (stock price, revenue, dates, percentages).
       - Format as a Markdown Table: | Metric | Value | Source |
       - If no hard data exists, state "No confirmed data available."
       
    2. **🗣️ Street Whispers (Community & Insider Sentiment)**
       - Summarize sentiment from Reddit/Twitter/Forums.
       - Highlight "Counter-Intuitive" views (e.g., Official news says X, but employees say Y).
       - MUST cite sources (e.g., "Source: Reddit r/WallStreetBets").
       
    3. **🧠 Synthesis (Verdict)**
       - A concise, punchy conclusion.
       - Plain English, no jargon.
    
    4. **JSON METADATA (Hidden)**
       - At the very end of your response, output a valid JSON block enclosed in ```json tags with:
         - "sentiment_score": (0-100, where 0=Bearish, 100=Bullish)
         - "heat_index": (0-100, based on discussion volume/controversy)
    """

    api_url = "https://api.deepseek.com/v1/chat/completions" # Default DeepSeek
    # Fallback/Adjustment if using a different provider can be added here
    
    payload = {
        "model": "deepseek-chat", # Or deepseek-reasoner if available
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.3 # Low temp for factual accuracy
    }
    
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(api_url, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        result = response.json()
        raw_text = result['choices'][0]['message']['content']
        
        # Extract JSON Metadata
        sentiment_score = 50
        heat_index = 50
        
        # Regex to find JSON block
        json_match = re.search(r"```json\s*(\{.*?\})\s*```", raw_text, re.DOTALL)
        if json_match:
            try:
                metadata = json.loads(json_match.group(1))
                sentiment_score = metadata.get("sentiment_score", 50)
                heat_index = metadata.get("heat_index", 50)
                # Remove JSON block from display content
                raw_text = raw_text.replace(json_match.group(0), "").strip()
            except:
                pass
        
        return {
            "content": raw_text,
            "sentiment_score": sentiment_score,
            "heat_index": heat_index
        }
        
    except Exception as e:
        logger.error(f"❌ LLM Call Failed: {e}")
        return None

def save_to_supabase(topic: str, report_data: Dict):
    """Save report to Supabase market_news table"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.warning("⚠️ Supabase credentials missing. Skipping DB save.")
        return

    # Extract Title (First line or Topic)
    lines = report_data["content"].strip().split('\n')
    title = lines[0].replace('#', '').strip()
    if len(title) > 100 or not title:
        title = f"Intel: {topic}"

    payload = {
        "title": title,
        "content": report_data["content"],
        "sentiment_score": report_data["sentiment_score"],
        "source": "NexusPulse HQ", # Branding
        "created_at": datetime.now().isoformat()
        # "heat_index" could be added if schema supports it
    }

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    try:
        url = f"{SUPABASE_URL}/rest/v1/market_news"
        resp = requests.post(url, json=payload, headers=headers)
        if resp.status_code in [200, 201]:
            logger.success("✅ Report saved to Supabase!")
        else:
            logger.error(f"❌ DB Save Failed: {resp.status_code} - {resp.text}")
            sys.exit(1)
    except Exception as e:
        logger.error(f"❌ DB Connection Error: {e}")
        sys.exit(1)

# ================= Main Entry Point =================

def main():
    parser = argparse.ArgumentParser(description="NexusPulse Intelligence Engine")
    parser.add_argument("--query", type=str, help="Target topic")
    parser.add_argument("--auto", action="store_true", help="Run in automatic mode") # Added for compatibility
    args = parser.parse_args()

    # Default Topics
    TOPICS = [
        "Tesla Supply Chain Rumors",
        "NVIDIA AI Chip Demand",
        "Bitcoin Regulation Leaks",
        "Apple VR Headset Sales"
    ]
    
    topic = args.query if args.query else TOPICS[0] # Default to first if random not desired
    
    logger.info(f"🚀 Starting Intelligence Mission: {topic}")
    
    # 1. Collect Data
    context = collect_intelligence(topic)
    if not context:
        logger.error("❌ Mission Aborted: Insufficient Data.")
        sys.exit(1)
        
    # 2. Analyze
    report = analyze_with_llm(topic, context)
    if not report:
        logger.error("❌ Mission Aborted: Analysis Failed.")
        sys.exit(1)
        
    # 3. Save
    save_to_supabase(topic, report)
    
    logger.success("🏆 Mission Accomplished.")

# ================= 主程序入口 ================= 

if __name__ == "__main__": 
    # 引入 argparse 专门处理 --auto 参数，防止 GitHub Actions 报错 
    import argparse 
    
    parser = argparse.ArgumentParser(description="NexusPulse Pocket Engine") 
    # 添加 --auto 参数 (虽然我们脚本里可能自动跑，但为了兼容性必须保留它) 
    parser.add_argument("--auto", action="store_true", help="Run in automatic mode") 
    parser.add_argument("--query", type=str, help="Optional query override", default=None) 
    
    # 解析参数 
    args = parser.parse_args() 
    
    # 无论有没有 --auto，都直接启动主逻辑 
    print(f"🚀 Starting NexusPulse Engine... (Auto Mode: {args.auto})") 
    main()
