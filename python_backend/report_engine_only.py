# -*- coding: utf-8 -*-
"""
Report Engine - Single File Soldier Version
独立运行版本，不依赖 BettaFish 的任何内部组件。
直接调用 DeepSeek API 生成报告并存入 Supabase。
"""

import os
import sys
import json
import time
import argparse
import requests
from datetime import datetime

# ================= Configuration =================

# 默认配置 (优先读取环境变量)
DEFAULT_API_BASE = "https://api.deepseek.com"
DEFAULT_MODEL = "deepseek-chat"

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

def get_env_var(name, default=None):
    """获取环境变量，支持 .env 此时可能未加载，依赖外部注入或系统环境"""
    return os.environ.get(name, default)

def call_deepseek(query, api_key, base_url=DEFAULT_API_BASE, model=DEFAULT_MODEL):
    """直接调用 DeepSeek API 生成报告"""
    logger.info(f"正在调用 AI 接口 ({base_url})...")
    logger.info(f"模型: {model}")
    logger.info(f"主题: {query}")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # 构建提示词
    system_prompt = """你是一位世界顶尖的市场情报分析师（Top Market Analyst），擅长通过深度分析生成极具洞察力的行业简报。
请根据用户提供的【查询主题】，撰写一份结构严谨、数据详实、排版精美的 Markdown 简报。

报告要求：
1. **深度与广度**：不要泛泛而谈，需包含具体的技术细节、市场动向或关键人物言论。
2. **结构清晰**：必须包含以下模块：
   - 📊 **Executive Summary** (核心摘要)：300字以内，直击要点。
   - 🚀 **Key Market Dynamics** (关键动态)：列出3-5个最重要的近期事件或趋势。
   - 💡 **Strategic Insights** (战略洞察)：深度分析背后的商业逻辑或技术影响。
   - ⚠️ **Risks & Opportunities** (风险与机遇)：客观评估。
3. **格式规范**：
   - 使用 Markdown 语法（# 标题, **加粗**, - 列表）。
   - 适当使用 Emoji 图标增加可读性。
   - 语气专业、客观、犀利。"""

    user_prompt = f"请根据当前最新的动态，针对以下主题生成深度分析简报：\n\n【{query}】"

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7,
        "stream": False
    }

    try:
        # 兼容 OpenAI 格式的接口
        url = f"{base_url.rstrip('/')}/chat/completions"
        response = requests.post(url, headers=headers, json=payload, timeout=120)
        
        if response.status_code != 200:
            logger.error(f"AI 接口调用失败: {response.status_code} - {response.text}")
            return None
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        logger.success("AI 报告生成成功！")
        return content

    except Exception as e:
        logger.error(f"调用 AI 接口时发生异常: {e}")
        return None

def save_to_supabase(title, content, supabase_url, supabase_key):
    """保存到 Supabase (使用 REST API 以确保最大兼容性)"""
    logger.info("正在保存数据到 Supabase...")

    if not supabase_url or not supabase_key:
        logger.error("Supabase 配置缺失，无法保存。")
        return False

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    data = {
        "title": title,
        "content": content,
        "created_at": datetime.now().isoformat()
    }

    try:
        # 假设表名为 market_news
        api_url = f"{supabase_url.rstrip('/')}/rest/v1/market_news"
        response = requests.post(api_url, headers=headers, json=data, timeout=30)

        if response.status_code in [200, 201]:
            logger.success("✓ 数据已成功存入 Supabase (market_news 表)")
            return True
        else:
            logger.error(f"保存失败: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        logger.error(f"保存到数据库时发生异常: {e}")
        return False

# ================= Main =================

def main():
    parser = argparse.ArgumentParser(description="Report Engine - Single File Soldier")
    parser.add_argument("--query", type=str, help="报告主题")
    parser.add_argument("--auto", action="store_true", help="自动模式 (占位符，本脚本默认自动)")
    args = parser.parse_args()

    # 1. 获取 Query
    query = args.query
    if not query:
        # 如果没有提供 Query，尝试从环境变量或默认值获取
        query = "Global Market Tech Trends"
        logger.warning(f"未指定 --query，使用默认主题: {query}")

    # 2. 获取配置
    # 尝试加载 .env (如果存在)
    try:
        from dotenv import load_dotenv
        load_dotenv()
        logger.info("已加载 .env 文件")
    except ImportError:
        logger.info("未找到 python-dotenv 或 .env，将使用系统环境变量")
    except Exception:
        pass

    api_key = get_env_var("REPORT_ENGINE_API_KEY")
    base_url = get_env_var("REPORT_ENGINE_BASE_URL", DEFAULT_API_BASE)
    
    supabase_url = get_env_var("SUPABASE_URL") or get_env_var("VITE_SUPABASE_URL") or get_env_var("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = get_env_var("SUPABASE_KEY") or get_env_var("VITE_SUPABASE_KEY") or get_env_var("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not api_key:
        logger.error("缺少 REPORT_ENGINE_API_KEY 环境变量")
        sys.exit(1)

    # 3. 生成报告
    report_content = call_deepseek(query, api_key, base_url)
    
    if not report_content:
        logger.error("报告生成失败，程序退出")
        sys.exit(1)

    # 4. 存入数据库
    # 标题加上时间戳
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    title = f"{query} - {timestamp}"
    
    save_to_supabase(title, report_content, supabase_url, supabase_key)

    logger.success("任务全部完成。")

if __name__ == "__main__":
    main()
