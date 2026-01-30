# -*- coding: utf-8 -*-
"""
Report Engine - Single File Soldier Version
Phase 2: Structured JSON Output & Analysis
独立运行版本，不依赖 BettaFish 的任何内部组件。
直接调用 DeepSeek API 生成结构化情报并存入 Supabase。
"""

import os
import sys
import json
import re
import time
import random
import requests
import argparse
import logging
from datetime import datetime

# ================= Configuration =================

# 默认配置
DEFAULT_API_BASE = "https://api.deepseek.com"
DEFAULT_MODEL = "deepseek-chat"

# Topic Matrix for Random Selection (Fallback)
TOPIC_MATRIX = [
    "Artificial Intelligence Market Trends",
    "Global Semiconductor Industry",
    "Electric Vehicle Market Dynamics",
    "Cryptocurrency & Blockchain Updates",
    "Renewable Energy Transition",
    "Biotechnology & Genomics",
    "Space Exploration & Commercialization",
    "Cybersecurity Threats & Solutions"
]

# ================= Logger =================

class SimpleLogger:
    def info(self, msg):
        print(f"[INFO] {datetime.now().strftime('%H:%M:%S')} - {msg}")
    
    def success(self, msg):
        print(f"[SUCCESS] {datetime.now().strftime('%H:%M:%S')} - {msg}")
    
    def error(self, msg):
        print(f"[ERROR] {datetime.now().strftime('%H:%M:%S')} - {msg}")
    
    def warning(self, msg):
        print(f"[WARN] {datetime.now().strftime('%H:%M:%S')} - {msg}")

logger = SimpleLogger()

# ================= Core Functions =================

def search_and_extract(topic):
    """
    Simulated search and extraction.
    In a real-world scenario, this would use a search API (Google/Bing) and a scraper.
    """
    logger.info(f"🔍 正在搜索关于 '{topic}' 的最新信息...")
    
    # Placeholder for scraping logic. 
    # Since we want to rely on the AI's internal knowledge if scraping is not set up:
    return f"Market intelligence data regarding {topic}. (Source: Internal Knowledge & Analysis)"

def analyze_with_deepseek(topic, context, api_key, base_url, model=DEFAULT_MODEL):
    """
    Phase 2: Analyze topic with DeepSeek and return structured JSON.
    """
    logger.info(f"🧠 正在调用 AI 分析: {topic}...")
    
    # System Prompt: 强制 JSON 格式输出，定义量化指标 
    system_prompt = """You are NexusPulse, an advanced AI Market Intelligence Analyst. 
Your goal is to convert raw scraped data into actionable financial intelligence. 

You MUST reply with a valid JSON object ONLY. No markdown formatting outside the JSON. 
The JSON structure must be: 
{ 
    "title": "A punchy, investor-focused title", 
    "summary": "A concise executive summary (max 200 words)", 
    "sentiment_score": 0 to 100 (0=Bearish, 50=Neutral, 100=Bullish), 
    "confidence_index": 0 to 10 (Based on data quality and source credibility), 
    "key_entities": ["Company A", "Token B", "Person C"], 
    "actionable_insight": "One specific strategic recommendation for investors/exporters.", 
    "risk_alert": "Potential downside or risk factor." 
} 
""" 

    user_prompt = f""" 
Analyze the following scraped news regarding: "{topic}". 
Ignore irrelevant ads or navigation text. Focus on causal chains (Effect -> Impact). 

=== RAW DATA START === 
{context} 
=== RAW DATA END === 
""" 

    headers = { 
        "Authorization": f"Bearer {api_key}", 
        "Content-Type": "application/json" 
    } 

    payload = { 
        "model": model, 
        "messages": [ 
            {"role": "system", "content": system_prompt}, 
            {"role": "user", "content": user_prompt} 
        ], 
        "temperature": 0.4, # 降低温度以保证 JSON 格式稳定 
        "response_format": {"type": "json_object"} # 如果 API 支持 (DeepSeek beta 可能支持) 
    } 

    try: 
        url = f"{base_url.rstrip('/')}/chat/completions" 
        response = requests.post(url, headers=headers, json=payload, timeout=120) 
        
        if response.status_code != 200: 
            logger.error(f"AI Error: {response.text}") 
            return None 

        content = response.json()['choices'][0]['message']['content'] 
        
        # 清洗可能存在的 Markdown 代码块标记 
        content = re.sub(r'^```json\s*', '', content) 
        content = re.sub(r'^```\s*', '', content) 
        content = re.sub(r'\s*```$', '', content) 
        
        return json.loads(content) 

    except json.JSONDecodeError: 
        logger.error("AI 返回了非 JSON 格式数据，解析失败。") 
        logger.error(f"Raw Output: {content[:100]}...") 
        return None 
    except Exception as e: 
        logger.error(f"AI 接口异常: {e}") 
        return None 

def save_to_supabase(data, supabase_url, supabase_key): 
    """ 
    保存结构化数据。 
    为了兼容现有的 'market_news' 表结构 (假设只有 title/content 字段)， 
    我们将 JSON 扁平化为 Markdown 格式存入 'content'，同时将 raw_json 存入 metadata (如果有)。 
    """ 
    logger.info("💾 正在写入数据库...")

    # 将 JSON 转换为人类可读的 Markdown 报告 
    md_content = f""" 
> **Sentiment Score:** {data['sentiment_score']}/100 📈 | **Confidence:** {data['confidence_index']}/10 🛡️ 

### 🚀 Actionable Insight 
**{data['actionable_insight']}** 

### 📊 Executive Summary 
{data['summary']} 

### ⚠️ Risk Alert 
{data['risk_alert']} 

--- 
*Entities: {', '.join(data['key_entities'])}* 
""" 

    payload = { 
        "title": f"[{data['sentiment_score']}] {data['title']}", # 在标题中直接显示分数 
        "content": md_content, 
        "created_at": datetime.now().isoformat(), 
        # 如果你的表有 'metadata' JSONB 字段，取消下面注释: 
        # "metadata": data 
    } 

    headers = { 
        "apikey": supabase_key, 
        "Authorization": f"Bearer {supabase_key}", 
        "Content-Type": "application/json", 
        "Prefer": "return=minimal" 
    } 

    try: 
        api_url = f"{supabase_url.rstrip('/')}/rest/v1/market_news" 
        response = requests.post(api_url, headers=headers, json=payload, timeout=30) 
        
        if response.status_code in [200, 201]: 
            logger.success("数据保存成功！") 
            return True 
        else: 
            logger.error(f"Supabase Error: {response.status_code} - {response.text}") 
            return False 
    except Exception as e: 
        logger.error(f"Database Exception: {e}") 
        return False 

# ================= Main Execution ================= 

def main(): 
    # 0. 环境初始化 
    try: 
        from dotenv import load_dotenv 
        load_dotenv() 
    except: 
        pass 
    
    # 增加 argparse 逻辑以支持 GitHub Actions 的 --query 参数
    parser = argparse.ArgumentParser(description="NexusPulse Report Engine")
    parser.add_argument("--query", type=str, help="Specify topic manually")
    parser.add_argument("--auto", action="store_true", help="Auto mode")
    args = parser.parse_args()

    api_key = os.environ.get("REPORT_ENGINE_API_KEY") 
    base_url = os.environ.get("REPORT_ENGINE_BASE_URL", DEFAULT_API_BASE) 
    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL") 
    supabase_key = os.environ.get("SUPABASE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") 

    if not api_key or not supabase_url: 
        logger.error("配置缺失: 请检查环境变量 API_KEY 和 SUPABASE_URL") 
        sys.exit(1) 

    # 1. 选择主题
    if args.query:
        target_topic = args.query
        logger.info(f"🎯 指定任务目标: {target_topic}")
    else:
        # 随机选择一个以保持 Cron 任务轻量化
        target_topic = random.choice(TOPIC_MATRIX) 
        logger.info(f"🎯 随机任务目标: {target_topic}") 

    # 2. 搜索 & 提取 (The Eyes) 
    context = search_and_extract(target_topic) 
    if not context: 
        logger.warning("信息收集为空，跳过本次任务。") 
        return 

    # 3. 分析 & 量化 (The Brain) 
    intelligence = analyze_with_deepseek(target_topic, context, api_key, base_url, DEFAULT_MODEL) 
    
    # 4. 存储 (The Memory) 
    if intelligence: 
        save_to_supabase(intelligence, supabase_url, supabase_key) 
    else: 
        logger.error("情报生成失败。") 

if __name__ == "__main__": 
    main()
