# -*- coding: utf-8 -*-
import os
import sys
import json
import argparse
import requests
from dotenv import load_dotenv
from loguru import logger
from tavily import TavilyClient

# Setup
current_file_path = os.path.abspath(__file__)
python_backend_dir = os.path.dirname(current_file_path)
project_root_dir = os.path.dirname(python_backend_dir)
load_dotenv(os.path.join(project_root_dir, '.env'))

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY") or os.getenv("GEMINI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

# Configure Logging
logger.remove()
logger.add(sys.stderr, format="<green>{time:HH:mm:ss}</green> | <level>{message}</level>", level="INFO")

# Initialize Tavily
tavily_client = None
if TAVILY_API_KEY:
    try:
        tavily_client = TavilyClient(api_key=TAVILY_API_KEY)
    except Exception as e:
        logger.warning(f"⚠️ Failed to initialize Tavily: {e}")
else:
    logger.warning("⚠️ TAVILY_API_KEY not found. Search features will be disabled.")

# ==========================================
# HELPER: LLM CLIENT
# ==========================================
def call_llm(user_prompt, system_prompt=None, response_format=None):
    if not DEEPSEEK_API_KEY:
        logger.error("❌ No API Key found")
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
        response = requests.post("https://api.deepseek.com/chat/completions", json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        return content
    except Exception as e:
        logger.error(f"❌ LLM Call Failed: {e}")
        return "{}" if response_format == "json" else str(e)

# ==========================================
# 1. 智能联想 (Brainstorm)
# ==========================================
def generate_focus_topic(product: str, persona: str) -> dict:
    logger.info(f"🧠 Brainstorming Focus Topic for: {product} x {persona}")
    prompt = f"""
    You are a Cross-Border E-commerce Strategist.
    Brainstorm the single most critical 'Winning Angle' or 'Pain Point' for Product: '{product}' targeting '{persona}'.
    Output strictly JSON: {{ "focus_topic": "...", "reasoning": "..." }}
    """
    try:
        res = call_llm(prompt, response_format="json")
        return json.loads(res)
    except Exception as e:
        logger.warning(f"⚠️ Focus Topic Generation Failed: {e}")
        return {"focus_topic": f"{product} for {persona}", "reasoning": "General Market Analysis"}

# ==========================================
# 2. 搜集情报 (The Eyes)
# ==========================================
def get_market_intel(topic: str) -> dict:
    """搜索市场趋势，并返回上下文和新闻列表"""
    if not tavily_client:
        return {"context": "Tavily API Key missing. Using internal knowledge only.", "news": []}
        
    try:
        logger.info(f"🔍 Searching Tavily for: {topic}...")
        # 搜索趋势、Reddit吐槽、合规风险
        query = f"{topic} market trends regulatory risks reddit complaints price point"
        response = tavily_client.search(query=query, search_depth="advanced", max_results=5)
        
        results = response.get("results", [])
        context = "\n".join([r.get("content", "") for r in results])
        
        # 格式化新闻用于前端展示
        news_list = []
        for r in results[:3]:
            news_list.append({
                "title": (r.get("title", "") or "No Title")[:50] + "...",
                "url": r.get("url", "#"),
                "source": r.get("url", "").split('/')[2] if r.get("url") else "Unknown",
                "sentiment": "Neutral" # 简单处理，实际可用LLM分析
            })
            
        return {"context": context[:6000], "news": news_list}
    except Exception as e:
        logger.warning(f"⚠️ Search failed: {e}")
        return {"context": "Search failed. Using internal knowledge only.", "news": []}

# ==========================================
# 3. 残酷分析引擎 (The Brain)
# ==========================================
GOD_MODE_SYSTEM_PROMPT = """
ROLE: You are the 'NexusPulse Strategic Engine'. You simulate a ruthless boardroom debate.

INPUT: Real-time market intelligence.

TASK: Analyze the product feasibility.
1. Compliance Officer: Check for FDA/CE/Medical claims. If found -> RISK 10 (FATAL).
2. CFO: Analyze Cash Flow. If product is bulky/low margin -> RISK HIGH.
3. Marketer: Look for 'Viral Hooks'.

OUTPUT FORMAT: JSON ONLY.
{
  "compliance": { "risk_score": 0-10, "is_fatal": bool, "fatal_reason": "..." },
  "supply": { "dos": int (inventory days), "cash_ratio": float (0-1), "is_stock_cliff": bool },
  "marketing": { "explosive_prob": float (0-1), "roi": float },
  "bull_bear_debate": { "bull_point": "...", "bear_point": "..." },
  "key_reason": "One sentence verdict reason."
}
"""

def analyze_with_llm(components: dict) -> dict:
    product = components.get("product")
    persona = components.get("persona", "General")
    focus_topic = components.get("focus_topic", product)
    
    logger.info(f"🚀 Starting God Mode Analysis: {focus_topic}")
    
    # 1. 获取真实数据
    intel = get_market_intel(focus_topic)
    market_context = intel["context"]
    market_news = intel["news"]
    
    # 2. LLM 思考
    user_prompt = f"""
    Analyze Target: {focus_topic} for {persona}.
    
    REAL MARKET DATA:
    {market_context}
    
    Additional Context: {components.get('fusion_instruction', '')}
    """
    
    try:
        raw_json_str = call_llm(user_prompt, system_prompt=GOD_MODE_SYSTEM_PROMPT, response_format="json")
        # Clean potential markdown code blocks
        raw_json_str = raw_json_str.replace("```json", "").replace("```", "").strip()
        raw_data = json.loads(raw_json_str)
    except Exception as e:
        logger.error(f"❌ Analysis Error: {e}")
        raw_data = {"compliance": {"risk_score": 5}, "key_reason": f"Analysis Error: {e}"}

    # 3. 提取数据与硬规则裁决
    comp = raw_data.get("compliance", {})
    supp = raw_data.get("supply", {})
    mark = raw_data.get("marketing", {})
    
    is_fatal = comp.get("risk_score", 0) >= 8 or comp.get("is_fatal", False)
    is_cash_risk = supp.get("dos", 0) > 45
    growth_score = mark.get("explosive_prob", 0) * 10
    
    # 最终裁决逻辑
    if is_fatal:
        verdict = "不建议做"
        final_reason = f"触发合规红线：{comp.get('fatal_reason', 'High Risk')}"
    elif is_cash_risk:
        verdict = "谨慎"
        final_reason = f"资金周转风险：DOS预计 {supp.get('dos', 0)} 天"
    elif growth_score >= 4:
        verdict = "可做"
        final_reason = f"增长潜力验证：爆款率 {int(mark.get('explosive_prob', 0)*100)}%"
    else:
        verdict = "谨慎"
        final_reason = "市场表现平庸，缺乏爆发点"

    # 4. 生成 Mermaid 逻辑图
    mermaid_code = f"""
    graph TD
        Start[🚀 {focus_topic[:10]}...] --> Check1{{👮 合规审计}}
        Check1 -- 分数:{comp.get('risk_score', 0)} --> Check2{{💰 资金审计}}
        
        Check2 -- DOS:{supp.get('dos', 0)}天 --> Check3{{📈 增长审计}}
        
        Check3 -- 爆款率:{int(mark.get('explosive_prob', 0)*100)}% --> Result[🏁 裁决: {verdict}]
        
        style Result fill:{'#ff4d4f' if verdict=='不建议做' else '#52c41a'},stroke:#fff,stroke-width:2px
    """

    # 5. 组装返回数据
    decision_data = {
        "verdict": verdict,
        "risk_score": comp.get("risk_score", 0),
        "key_reason": final_reason,
        "actionable_step": "根据红线扫描，立即优化Listing关键词，规避医疗宣称。",
        # --- 关键：把图表和新闻塞回去 ---
        "mermaid_code": mermaid_code,
        "market_news": market_news,
        # ---------------------------
        "quantitative_metrics": {
            "compliance_risk_score": comp.get("risk_score", 0),
            "dos": supp.get("dos", 0),
            "explosive_prob": mark.get("explosive_prob", 0)
        },
        "bull_bear_debate": raw_data.get("bull_bear_debate", {})
    }
    
    return decision_data

# ==========================================
# 4. 生成报告 (Markdown Translator)
# ==========================================
def generate_ceo_report(data: dict) -> str:
    verdict = data.get('verdict', 'Unknown')
    icon = "🔴" if verdict == "不建议做" else ("🟢" if verdict == "可做" else "🟡")
    metrics = data.get('quantitative_metrics', {})
    debate = data.get('bull_bear_debate', {})
    
    # Safely format values
    risk_score = metrics.get('compliance_risk_score', 0)
    dos = metrics.get('dos', 0)
    explosive_prob = metrics.get('explosive_prob', 0)
    
    risk_status = "❌ 熔断" if risk_score >= 8 else "✅ 安全"
    dos_status = "⚠️ 积压" if dos > 45 else "✅ 健康"
    prob_status = "🔥 极高" if explosive_prob > 0.7 else "❄️ 一般"
    
    return f"""
# 🚀 跨境决策战报

## 1. 核心裁决：{icon} {verdict}
> **决策依据**：{data.get('key_reason')}

## 2. 关键指标看板
| 维度 | 评分/数值 | 状态 |
| :--- | :--- | :--- |
| **合规风控** | {risk_score}/10 | {risk_status} |
| **资金周转** | DOS: {dos}天 | {dos_status} |
| **爆款概率** | {int(explosive_prob*100)}% | {prob_status} |

## 3. 多空博弈 (Deep Dive)
* **🟢 增长机会**：{debate.get('bull_point', '无')}
* **🔴 致命风险**：{debate.get('bear_point', '无')}

## 4. 落地抓手
👉 **{data.get('actionable_step')}**
"""

# ==========================================
# MAIN ENTRY POINT
# ==========================================
def main():
    # Force stdout to use utf-8
    if sys.stdout.encoding != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except:
            pass

    parser = argparse.ArgumentParser()
    parser.add_argument("query", nargs="?", help="Target topic")
    parser.add_argument("--query", dest="query_flag", type=str)
    parser.add_argument("--category", dest="category", type=str)
    parser.add_argument("--mode", dest="mode", type=str) # Keep for compatibility
    parser.add_argument("--strategy_mode", dest="strategy_mode", type=str) # Keep for compatibility
    parser.add_argument("--auto", action="store_true") # Keep for compatibility
    
    # Accept other args to avoid crashing if called with them
    parser.add_argument("--inventory", type=int)
    parser.add_argument("--sales", type=int)
    parser.add_argument("--listing", type=str)
    parser.add_argument("--pain_point", type=str)
    
    args = parser.parse_args()
    
    topic = args.query_flag or args.query
    if not topic:
        print("---JSON_START---")
        print(json.dumps({"status": "error", "message": "No topic provided"}))
        print("---JSON_END---")
        return

    # 1. Smart Topic Association
    product = topic
    persona = args.category if args.category else "General Market"
    
    focus_data = generate_focus_topic(product, persona)
    focus_topic = focus_data.get("focus_topic", product)
    reasoning = focus_data.get("reasoning", "")
    
    # 2. God Mode Analysis
    components = {
        "product": product,
        "persona": persona,
        "focus_topic": focus_topic,
        "fusion_instruction": f"Focus on {focus_topic}. Reasoning: {reasoning}"
    }
    
    decision_data = analyze_with_llm(components)
    
    # 3. Generate Report
    report_md = generate_ceo_report(decision_data)
    
    # 4. Output Package
    output_package = {
        "status": "success",
        "report_title": f"CEO Report: {focus_topic}",
        "full_markdown_report": report_md,
        "mermaid_code": decision_data.get("mermaid_code", ""),
        "market_news": decision_data.get("market_news", []),
        "structured_data": decision_data,
        "metadata": {
            "focus_topic": focus_topic,
            "reasoning": reasoning,
            "product": product,
            "persona": persona
        }
    }
    
    print("---JSON_START---")
    print(json.dumps(output_package, ensure_ascii=False))
    print("---JSON_END---")

if __name__ == "__main__":
    main()