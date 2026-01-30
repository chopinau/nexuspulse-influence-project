# -*- coding: utf-8 -*-
"""
Report Engine - Dispatcher Version
Phase 3: Dispatcher for BettaFish Framework
作为一个调度器，调用 BettaFish 核心能力 (InsightEngine) 生成报告并存入 Supabase。
"""

import os
import sys
import json
import random
import argparse
import requests
import re
from datetime import datetime
from loguru import logger
from dotenv import load_dotenv

# ================= Path Fix =================
# 确保能找到 BettaFish 包 (假设 BettaFish 在项目根目录，即 report_engine_only.py 的上两级)
# D:\my-web-app\nexuspulse-influence-project new git\python_backend\report_engine_only.py
# 需要加入 D:\my-web-app
current_file_path = os.path.abspath(__file__)
python_backend_dir = os.path.dirname(current_file_path) # python_backend
project_root_dir = os.path.dirname(python_backend_dir)  # nexuspulse-influence-project new git
workspace_root = os.path.dirname(project_root_dir)      # my-web-app

if workspace_root not in sys.path:
    sys.path.append(workspace_root)

# 尝试导入 BettaFish
try:
    from BettaFish.InsightEngine.agent import create_agent, DeepSearchAgent
    logger.success(f"成功导入 BettaFish 框架: {workspace_root}")
except ImportError as e:
    logger.error(f"无法导入 BettaFish 框架，请检查路径: {workspace_root}")
    logger.error(f"Error: {e}")
    sys.exit(1)

# ================= Configuration =================

# Load environment variables
load_dotenv(os.path.join(project_root_dir, '.env'))

# Supabase Config
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.warning("Supabase 环境变量未设置，将跳过数据库存储。")

# Topic Matrix for Random Selection
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

# ================= Helper Functions =================

def map_sentiment_to_score(label: str) -> int:
    """将情感标签转换为 0-100 的分数"""
    mapping = {
        "非常负面": 0,
        "Very Negative": 0,
        "负面": 25,
        "Negative": 25,
        "中性": 50,
        "Neutral": 50,
        "正面": 75,
        "Positive": 75,
        "非常正面": 100,
        "Very Positive": 100
    }
    return mapping.get(label, 50) # 默认为中性 50

def save_to_supabase(intelligence: dict):
    """Save intelligence data to Supabase"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.warning("Supabase credentials missing. Skipping DB save.")
        return

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    url = f"{SUPABASE_URL}/rest/v1/market_news"
    
    try:
        response = requests.post(url, json=intelligence, headers=headers)
        if response.status_code in [200, 201]:
            logger.success("✅ 数据已成功存入 Supabase")
        else:
            logger.error(f"❌ Supabase 存储失败: {response.status_code} - {response.text}")
            sys.exit(1) # Fail the workflow if DB save fails
    except Exception as e:
        logger.error(f"❌ 连接 Supabase 异常: {e}")
        sys.exit(1)

# ================= Main Logic =================

def main():
    parser = argparse.ArgumentParser(description="NexusPulse Report Dispatcher (BettaFish Powered)")
    parser.add_argument("--query", type=str, help="Specific topic to research")
    args = parser.parse_args()

    # 1. 确定目标话题
    target_topic = args.query if args.query else random.choice(TOPIC_MATRIX)
    logger.info(f"🎯 目标话题: {target_topic}")

    # 2. 初始化 BettaFish Agent
    logger.info("🚀 启动 BettaFish InsightEngine...")
    try:
        agent = create_agent()
        
        # 3. 执行深度研究 (调用 BettaFish 核心能力)
        # research() 返回的是 Markdown 格式的报告内容
        logger.info("🔍 Agent 正在进行深度搜索与分析 (这可能需要几分钟)...")
        report_content = agent.research(query=target_topic, save_report=False)
        
        if not report_content:
            logger.error("❌ BettaFish 未返回任何内容。")
            sys.exit(1)
            
        logger.success("✅ 报告生成完毕")

        # 4. 情感分析 (对生成的报告进行二次分析以获取整体情绪分)
        logger.info("🎭 正在计算报告情感分数...")
        sentiment_score = 50 # Default
        try:
            sentiment_result = agent.analyze_sentiment_only(report_content)
            # 解析结果: {"results": [{"sentiment_label": "正面", ...}]}
            if sentiment_result and sentiment_result.get("success") and sentiment_result.get("results"):
                first_result = sentiment_result["results"][0]
                label = first_result.get("sentiment_label", "中性")
                sentiment_score = map_sentiment_to_score(label)
                logger.info(f"   - 情感标签: {label} -> 分数: {sentiment_score}")
            else:
                logger.warning("   - 情感分析未返回有效结果，使用默认分 50")
        except Exception as e:
            logger.warning(f"   - 情感分析过程异常: {e}，使用默认分 50")

        # 5. 构造数据包
        # 提取标题 (假设第一行是标题)
        lines = report_content.strip().split('\n')
        title = lines[0].strip().lstrip('#').strip() if lines else target_topic
        # 如果标题太长或为空，使用 query
        if not title or len(title) > 100:
            title = f"Report: {target_topic}"
        
        intelligence = {
            "title": title,
            "content": report_content, # Markdown content
            "sentiment_score": sentiment_score,
            "source": "BettaFish Engine",
            "created_at": datetime.now().isoformat()
        }
        
        # 6. 存储到 Supabase
        save_to_supabase(intelligence)

    except Exception as e:
        logger.exception(f"❌ BettaFish 运行过程中发生未捕获异常: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
