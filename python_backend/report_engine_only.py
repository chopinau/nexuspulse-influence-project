# -*- coding: utf-8 -*-
"""
NexusPulse Report Engine - Level 2: Agent Skills + BettaFish Integration
"Ultimate Backend Upgrade" Edition
Features:
- Agent Skills (SOP) Routing
- BettaFish (Multi-Agent Debate)
- DeepSeek-V3 Intent Classification
- Tavily API Integration
- Structured Markdown Output with Mermaid Diagrams
- Direct Supabase Integration (Reports Cache + Market News)
"""

import os
import sys
import json
import re
import argparse
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from pathlib import Path

# Third-party imports
from dotenv import load_dotenv
from loguru import logger
from tavily import TavilyClient
# Removed supabase dependency to avoid pyiceberg/pyroaring/visual c++ issues
# from supabase import create_client, Client 

from agent_skills import SKILL_SET, SEARCH_PROMPTS

# ================= Configuration & Setup =================

# Determine Paths
current_file_path = Path(__file__).resolve()
python_backend_dir = current_file_path.parent
project_root_dir = python_backend_dir.parent
skills_dir = python_backend_dir / 'skills'

# Load Environment Variables
load_dotenv(dotenv_path=project_root_dir / '.env')

# API Keys
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("REPORT_ENGINE_API_KEY")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

if not TAVILY_API_KEY:
    logger.warning("⚠️ TAVILY_API_KEY not found in environment variables. Will fallback to Mock Data.")

# Constants
MAX_CONTENT_LENGTH = 15000  # Truncate combined text to avoid context overflow

# Configure Logging
logger.remove()
logger.add(sys.stderr, format="<green>{time:HH:mm:ss}</green> | <level>{message}</level>", level="INFO")

# ================= Core Functions =================

def load_skill_sop(skill_name: str) -> str:
    """
    Load SOP from skills directory
    """
    skill_file = skills_dir / f"{skill_name}.md"
    if skill_file.exists():
        with open(skill_file, 'r', encoding='utf-8') as f:
            return f.read()
    # Fallback to general consultant
    general_file = skills_dir / "general_consultant.md"
    if general_file.exists():
        with open(general_file, 'r', encoding='utf-8') as f:
            return f.read()
    return ""

def determine_user_intent(query: str) -> str:
    """
    Determine user intent using DeepSeek-V3
    Returns skill name (e.g., "inventory_risk", "marketing", "crisis_management")
    """
    # --- FIX 1: FORCE INTENT ROUTING ---
    force_keywords = ["temu", "shein", "amazon", "tiktok", "swimwear", "inventory", "stock", "fba", "dropshipping", "e-commerce", "选品", "跨境", "库存", "备货"]
    if any(k in query.lower() for k in force_keywords):
        logger.info("DEBUG: 🟢 Forced Intent Routing -> Cross-Border Skill Loaded.")
        return "cross_border_ecommerce"

    if not DEEPSEEK_API_KEY:
        logger.warning("⚠️ API Key missing. Using default skill.")
        return "general_consultant"
    
    logger.info("🧠 Analyzing user intent...")
    
    system_prompt = "你是一个意图分类器。请分析用户的问题，判断其属于哪个垂直领域，并返回对应的技能名称。"
    user_prompt = f"用户问题: {query}\n\n请从以下选项中选择一个最合适的技能名称：\n1. inventory_risk (选品风控)\n2. marketing (营销)\n3. crisis_management (危机公关)\n4. general_consultant (通用顾问)\n\n只返回技能名称，不返回其他内容。"
    
    def call_llm(system_p, user_p):
        api_url = "https://api.deepseek.com/v1/chat/completions"
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": system_p},
                {"role": "user", "content": user_p}
            ],
            "temperature": 0.1
        }
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        try:
            response = requests.post(api_url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"❌ Intent classification failed: {e}")
            return "general_consultant"
    
    intent = call_llm(system_prompt, user_prompt)
    if intent:
        intent = intent.strip().lower()
    else:
        return "general_consultant"
    
    # Validate intent
    valid_skills = ["inventory_risk", "marketing", "crisis_management", "general_consultant"]
    if intent not in valid_skills:
        logger.warning(f"⚠️ Invalid intent: {intent}. Using general_consultant.")
        return "general_consultant"
    
    logger.info(f"🎯 User intent classified as: {intent}")
    return intent

def collect_intelligence(query: str, mode: str = "GENERAL") -> str:
    """
    Collect intelligence using Tavily API with Multi-Persona Expansion.
    Step 1: Intelligent Search Expansion (The Setup)
    """
    logger.info(f"🔍 Starting Intelligent Search Expansion for: {query} (Mode: {mode})")
    
    try:
        # 1. Initialize Tavily
        api_key = TAVILY_API_KEY
        if not api_key:
            raise ValueError("TAVILY_API_KEY not found in environment variables")
        client = TavilyClient(api_key=api_key)

        # 2. Define Sub-Queries (Adaptive based on Mode)
        search_suffix = SEARCH_PROMPTS.get(mode, SEARCH_PROMPTS["GENERAL"])
        
        sub_queries = [
            f"{query} {search_suffix}",
            f"{query} market trends growth opportunities viral signals",   # For Bull
            f"{query} supply chain costs inventory risk price competition", # For Bear
            f"{query} consumer complaints product quality negative reviews" # For Auditor/Risk
        ]
        
        combined_context = ""
        
        # 3. Execute Searches
        for sub_q in sub_queries:
            logger.info(f"   🔎 Sub-Query: {sub_q}")
            try:
                response = client.search(query=sub_q, search_depth="advanced", max_results=2, include_answer=False)
                combined_context += f"\n--- SEARCH CONTEXT: {sub_q} ---\n"
                for result in response.get('results', []):
                    combined_context += f"- {result.get('content')}\n"
            except Exception as e:
                logger.warning(f"   ⚠️ Sub-query failed: {e}")
                
        if not combined_context.strip():
             raise ValueError("All sub-queries returned empty results")
             
        logger.success(f"✅ Intelligence Collection Complete. Context size: {len(combined_context)} chars.")
        return combined_context[:MAX_CONTENT_LENGTH]

    except Exception as e:
        logger.warning(f"DEBUG: ⚠️ Search/API failed ({e}). Proceeding with Internal Knowledge.")
        # FALLBACK CONTEXT FOR LLM - FORCE EXECUTION
        return f"Search failed (Error: {e}). Please analyze '{query}' based on your internal knowledge about this industry. Do NOT hallucinate specific recent news if you don't know it, but provide general strategic analysis based on standard industry logic for this topic."

def strip_code_fences(s: str) -> str:
    if not s:
        return ""
    m = re.search(r"```(?:mermaid)?\s*([\s\S]*?)```", s, flags=re.IGNORECASE)
    if m:
        return m.group(1).strip()
    s = re.sub(r"^\s*```(?:mermaid)?\s*", "", s, flags=re.IGNORECASE)
    s = re.sub(r"\s*```\s*$", "", s)
    return s.strip()


def extract_risk_score(text: str) -> int:
    if not text:
        return 5
    m = re.search(r"(?:Risk\s*Score|风险评分|风险指数)[：:\s]*([0-9]{1,2})\s*/\s*10", text, flags=re.IGNORECASE)
    if not m:
        m = re.search(r"([0-9]{1,2})\s*/\s*10", text)
    if not m:
        return 5
    try:
        v = int(m.group(1))
    except Exception:
        return 5
    return max(0, min(10, v))

def analyze_with_llm(topic: str, context: str, mode: str = "GENERAL") -> Dict:
    """
    Call DeepSeek/Gemini to generate the report with Agent Skills + BettaFish architecture.
    Returns parsed JSON object with 'content', 'sentiment_score', etc.
    """
    if DEEPSEEK_API_KEY:
        logger.info(f"DEBUG: ✅ API Key detected. Engaging Expert Agents (Mode: {mode})...")
    
    if not DEEPSEEK_API_KEY:
        logger.warning("⚠️ API Key missing. Using model base knowledge for analysis.")
        # ... (keep existing fallback logic)
        report_title = f"{topic} Market Sentiment & Strategic Analysis"
        content_md = f"# 关于 {topic} 的深度战略研判\n\n## 📋 核心结论\n> 决策建议：基于模型基座分析\n> \n> 未找到实时信号，基于行业最佳实践提供建议。\n\n## ⚖️ 多空博弈\n基于模型内置知识进行分析\n\n## 📊 数据支持\n无实时数据\n\n## 💡 行动建议\n1. [P1] 重要：基于行业最佳实践制定战略\n2. [P2] 次要：持续监控市场动态\n3. [P3] 常规：建立预警机制\n\n## 🔄 逻辑流程图\n\n```mermaid\ngraph TD\n    Start[开始分析] --> NoData[无实时数据]\n    NoData --> ModelKnowledge[基于模型知识]\n    ModelKnowledge --> GenerateAnalysis[生成分析]\n    GenerateAnalysis --> FinalConclusion[最终结论]\n```"
        return {
            "report_title": report_title,
            "content": content_md,
            "mermaid_code": "graph TD\n    Start[开始分析] --> NoData[无实时数据]\n    NoData --> ModelKnowledge[基于模型知识]\n    ModelKnowledge --> GenerateAnalysis[生成分析]\n    GenerateAnalysis --> FinalConclusion[最终结论]",
            "debate_details": "基于模型内置知识的模拟辩论：在缺乏实时数据的情况下，建议以保守策略为主，建立监控和预警机制。",
            "metadata": {
                "sentiment_score": 50,
                "heat_index": 0,
                "impact_score": 0,
                "sop_based": False,
                "sop_name": "general_consultant"
            },
            "raw_response": content_md
        }

    logger.info("🧠 Initializing Agent Skills + BettaFish architecture...")

    # --- STEP 1: SKILL ROUTING AND LOADING ---
    logger.info(f"🔍 Step 1: Skill Routing and Loading... (Forced Mode: {mode})")
    # Override automatic intent with manual mode
    skill_name = mode.lower()
    current_skill_sop = load_skill_sop(skill_name)
    if not current_skill_sop:
        logger.warning("⚠️ No SOP loaded. Using default behavior.")
    logger.info(f"   ✅ Loaded SOP: {skill_name}.md")

    # --- STEP 2: ROLE INITIALIZATION (PROMPT INJECTION) ---
    logger.info("🎭 Step 2: Role Initialization...")
    
    # Get Persona Definition
    persona_def = SKILL_SET.get(mode, SKILL_SET["GENERAL"])

    BULL_PROMPT = f"""
    You are **The Growth Strategist (Bull)**.
    Your Philosophy: "Blue Ocean", viral trends, and platform dividends.
    Tone: Optimistic, strategic, visionary.
    
    【CRITICAL INPUT】: You must strictly follow this SOP: {current_skill_sop}
    
    YOUR MISSION:
    Based on the provided market data, identify EVERY possible growth opportunity.
    - Look for "Viral Signals" (e.g., social media trends).
    - Look for "Platform Dividends" (e.g., new features, underserved niches).
    - Ignore the risks. Your job is to sell the dream.
    
    OUTPUT FORMAT:
    - Title: 🚀 BULL CASE: [Exciting Title]
    - Key Opportunities: Bullet points
    - Growth Catalysts: Bullet points
    - Market Potential: Short paragraph
    """

    BEAR_PROMPT = f"""
    You are **The Risk Controller (Bear)**.
    Your Philosophy: "Inventory Trap", margin compression, and supply chain fragility.
    Tone: Ruthless, pessimistic, data-driven.
    
    【CRITICAL INPUT】: You must strictly follow this SOP: {current_skill_sop}
    
    YOUR MISSION:
    Based on the provided market data, destroy the Bull's dream. Find every flaw.
    - Look for "Inventory Risks" (e.g., seasonal cliffs, saturation).
    - Look for "Cost Spikes" (e.g., raw materials, shipping).
    - Look for "Compliance/Returns" issues.
    
    OUTPUT FORMAT:
    - Title: 🐻 BEAR CASE: [Warning Title]
    - Critical Risks: Bullet points
    - Failure Points: Bullet points
    - Downside Scenarios: Short paragraph
    """

    MODERATOR_PROMPT = f"""
    {persona_def}
    
    【CRITICAL INPUT】: Your decision framework is this SOP: {current_skill_sop}
    
    YOUR MISSION:
    Synthesize the conflict between the Bull (Growth) and Bear (Risk).
    - Do NOT just summarize. JUDGE them.
    - Identify who has the stronger evidence.
    - Produce a final actionable strategy.
    - **QUANTIFY EVERYTHING**: You MUST estimate scores (0-10, 0-100) based on the sentiment and evidence strength.
    
    STRICT OUTPUT FORMAT REQUIREMENTS:
    
    1. **📋 核心结论**
       - **禁止废话**：不要说"综上所述"、"总之"等开场白，直接用"决策建议：[动作]"开头。
       - **强制引用**：必须引用多头和空头的具体论点，例如："针对多头提到的 A 机会，空头提出的 B 风险更具威胁..."
       - **量化风险**：对关键风险进行 1-10 分的打分，并说明打分理由。
       - **反共识洞察**：必须找出一个"大众可能忽视，但 AI 通过多方博弈发现的微小信号"，并详细说明其重要性。
       - **Markdown 格式**：【核心结论】部分必须使用引言块（`> Blockquote`）样式。
       - 基于 SOP 的决策理由
       
    2. **⚖️ 多空博弈**
       - 总结多头和空头的核心观点
       - **强制引用**双方的具体论点，例如："针对多头提到的 A 机会，空头提出的 B 风险更具威胁..."
       - 分析双方论点的 strengths 和 weaknesses
       
    3. **📊 数据支持**
       - 从 RAW DATA 中提取关键数据点
       - 以表格形式呈现
       
    4. **💡 行动建议**
       - **Markdown 格式**：必须使用有序列表，并带有优先级标签（如：[P0] 紧急, [P1] 重要）。
       - 具体可执行的措施
       - 优先级排序
    
    5. **🔄 逻辑流程图**
       - 在报告末尾添加 Mermaid 代码块，展示决策流程
       - **Mermaid 兼容性**：只使用 `graph TD` 或 `flowchart LR` 语法。
       - **节点命名**：禁止在节点名称中使用特殊字符（如括号、单引号），否则前端 LogicFlow 会崩溃。
       - 示例格式：
       ```mermaid
       graph TD
           Start[开始分析] --> Data[数据收集]
           Data --> Bull[多头分析]
           Data --> Bear[空头分析]
           Bull --> Evaluate[决策评估]
           Bear --> Evaluate
           Evaluate --> Conclusion[最终结论]
       ```
    
    6. **JSON METADATA (MANDATORY)**
       - At the very end of your response, output a valid JSON block containing these exact fields:
       ```json
       {{
         "risk_score": (Integer 0-10, where 10 is maximum risk),
         "market_heat": (Integer 0-100, where 100 is viral/hot),
         "bull_force": (Integer 0-100, strength of bull argument),
         "bear_force": (Integer 0-100, strength of bear argument),
         "sentiment_score": (Integer 0-100, 0=Bearish, 100=Bullish),
         "one_line_verdict": (String, max 10 words summary)
       }}
       ```
    """

    # --- HELPER: GENERIC LLM CALL ---
    def call_llm(system_p, user_p):
        logger.info("DEBUG: Calling DeepSeek...")
        api_url = "https://api.deepseek.com/v1/chat/completions"
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": system_p},
                {"role": "user", "content": user_p}
            ],
            "temperature": 0.7
        }
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        try:
            response = requests.post(api_url, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            logger.info(f"DEBUG: DeepSeek Response: {content[:100]}...") # Log first 100 chars
            return content
        except Exception as e:
            logger.error(f"❌ LLM Call Failed: {e}")
            return None

    # --- STEP 3: EXECUTION CHAIN ---
    # Step A: Already completed (search_web called before this function)
    
    # Step B: Bull Run
    logger.info("🐂 Step 3B: Bull Agent Analysis...")
    bull_response = call_llm(BULL_PROMPT, f"TOPIC: {topic}\n\nRAW DATA:\n{context}")
    if not bull_response: return None
    logger.info("   ✅ Bull Agent reported.")

    # Step C: Bear Run
    logger.info("🐻 Step 3C: Bear Agent Analysis...")
    bear_response = call_llm(BEAR_PROMPT, f"TOPIC: {topic}\n\nRAW DATA:\n{context}")
    if not bear_response: return None
    logger.info("   ✅ Bear Agent reported.")

    # Step D: Final Verdict
    logger.info("⚖️ Step 3D: Moderator Deliberation...")
    final_input = f"""
    TOPIC: {topic}
    
    RAW INTELLIGENCE DATA:
    {context}
    
    🐂 BULL AGENT ARGUMENT:
    {bull_response}
    
    🐻 BEAR AGENT ARGUMENT:
    {bear_response}
    """
    
    final_content = call_llm(MODERATOR_PROMPT, final_input)
    if not final_content: return None
    
    logger.success("🚀 Strategic Decision Generated!")

    # Parse JSON Metadata
    sentiment_score = 50
    heat_index = 50
    impact_score = 50
    risk_score = 5 # Default
    mermaid_code = ""
    debate_details = ""
    
    try:
        # Extract Mermaid Code - Robust Extraction
        # First try to find code blocks
        mermaid_match = re.search(r'```mermaid\s*([\s\S]*?)\s*```', final_content, re.DOTALL)
        if mermaid_match:
            mermaid_code = mermaid_match.group(1).strip()
        else:
            # If no blocks, try to find "graph TD" or similar patterns directly if the model forgot fences
            graph_match = re.search(r'(graph\s+[TD|LR|TB][\s\S]*)', final_content, re.DOTALL)
            if graph_match:
                mermaid_code = graph_match.group(1).strip()

        # Force Clean Markdown Pollution
        if mermaid_code:
            mermaid_code = re.sub(r'```mermaid|```', '', mermaid_code).strip()

        # Fallback if empty
        if not mermaid_code:
            mermaid_code = "graph TD; A[Error] --> B[No Data];"

        # Extract JSON
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', final_content, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
            data = json.loads(json_str)
            sentiment_score = data.get("sentiment_score", 50)
            heat_index = data.get("market_heat", 50) # Mapped from new prompt
            impact_score = data.get("bull_force", 50) # Using bull force as proxy for impact/opportunity
            risk_score = data.get("risk_score", 5)
            # Optional: Remove JSON from content
            final_content = final_content.replace(json_match.group(0), "")
        
        # Extract debate details section
        debate_match = re.search(r'##\s*⚖️\s*多空博弈[\s\S]*?(?=^##\s|\Z)', final_content, re.MULTILINE)
        if debate_match:
            debate_details = debate_match.group(0).strip()
    except Exception as e:
        logger.warning(f"⚠️ Failed to parse metadata: {e}")

    # Generate report title
    report_title = f"{topic} Market Sentiment & Strategic Analysis"

    return {
        "status": "success",
        "report_title": report_title,
        "verdict_text": final_content.split('###')[0].strip(),
        "full_markdown_report": final_content,
        "debate_details": debate_details or "辩论详情不可用。",
        "mermaid_code": strip_code_fences(mermaid_code),
        "structured_data": {
            "sentiment_score": sentiment_score,
            "heat_index": heat_index,
            "impact_score": impact_score,
            "risk_score": risk_score, # Pass risk score explicitly
            "sop_based": True,
            "sop_name": skill_name
        }
    }


def check_cache(query: str) -> Optional[Dict]:
    """
    Step A: Check Supabase 'reports' table for recent cached reports.
    Returns the report_json if found and fresh (< 24h), else None.
    Uses requests for robustness.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None

    logger.info(f"🕵️ Checking Cache for: {query}")
    try:
        # Calculate 24 hours ago
        one_day_ago = (datetime.utcnow() - timedelta(hours=24)).isoformat()
        
        # Construct URL
        # Filter: query == query AND created_at > one_day_ago
        # Note: Need to URL encode
        url = f"{SUPABASE_URL}/rest/v1/reports"
        params = {
            "query": f"eq.{query}",
            "created_at": f"gt.{one_day_ago}",
            "select": "*",
            "order": "created_at.desc",
            "limit": "1"
        }
        
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        data = response.json()

        if data and len(data) > 0:
            cached_report = data[0]
            logger.success("✅ Cache HIT! Returning stored report.")
            return cached_report.get("report_json")
        
        logger.info("❌ Cache MISS. Proceeding to generation.")
        return None

    except Exception as e:
        logger.warning(f"⚠️ Cache check failed: {e}")
        return None

import time

def save_report_to_db(query: str, output_package: Dict):
    """
    Step C: Save the full report package to 'reports' table.
    Uses requests for robustness with retries.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        return

    logger.info("💾 Saving to 'reports' table...")
    
    url = f"{SUPABASE_URL}/rest/v1/reports"
    payload = {
        "query": query,
        "report_json": output_package,
        "source": "manual" 
    }
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            logger.success("✅ Saved to reports table.")
            return
        except Exception as e:
            logger.warning(f"⚠️ Attempt {attempt + 1}/{max_retries} failed to save to 'reports': {e}")
            if attempt < max_retries - 1:
                time.sleep(2) # Wait 2 seconds before retry
            else:
                logger.error(f"❌ Final failure to save to 'reports': {e}")


def save_to_market_news(topic: str, report_data: Dict):
    """
    Legacy/Feed Save: Save report to Supabase market_news table
    This ensures the report shows up in the 'Live Global Feed'
    Uses requests for robustness with retries.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.warning("⚠️ Supabase credentials missing. Skipping Market News save.")
        return

    # Extract Title (Use report_title if available, otherwise use first line or Topic)
    title = report_data.get("report_title", "")
    if not title:
        lines = report_data.get("full_markdown_report", "").strip().split('\n')
        if lines:
            title = lines[0].replace('#', '').strip()
        if len(title) > 100 or not title:
            title = f"Intel: {topic}"

    payload = {
        "title": title,
        "content": report_data.get("full_markdown_report", ""),
        "metadata": {
            "report_title": report_data.get("report_title", title),
            "sentiment_score": report_data.get("structured_data", {}).get("sentiment_score", 50),
            "heat_index": report_data.get("structured_data", {}).get("heat_index", 50),
            "impact_score": report_data.get("structured_data", {}).get("impact_score", 50),
            "mermaid_code": report_data.get("mermaid_code", ""),
            "summary": "NexusPulse Intelligence Report"
        },
        "source": "NexusPulse HQ", # Branding
        "created_at": datetime.now().isoformat()
    }

    url = f"{SUPABASE_URL}/rest/v1/market_news"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            logger.success("✅ Published to Market News Feed!")
            return
        except Exception as e:
            logger.warning(f"⚠️ Attempt {attempt + 1}/{max_retries} failed to publish to Market News: {e}")
            if attempt < max_retries - 1:
                time.sleep(2)
            else:
                logger.error(f"❌ Final failure to publish to Market News: {e}")

# ================= Main Entry Point =================

def main():
    # Force stdout to use utf-8 to handle Chinese characters in JSON
    if sys.stdout.encoding != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except:
            pass

    parser = argparse.ArgumentParser(description="NexusPulse Intelligence Engine")
    parser.add_argument("query", nargs="?", help="Target topic (positional)")
    parser.add_argument("mode", nargs="?", help="Expert Mode (positional)")
    parser.add_argument("--query", dest="query_flag", type=str, help="Target topic")
    parser.add_argument("--mode", dest="mode_flag", type=str, help="Expert Mode (e.g. TIKTOK_RISK)")
    parser.add_argument("--auto", action="store_true", help="Run in automatic mode") # Added for compatibility
    args = parser.parse_args()

    # Default Topics
    TOPICS = [
        "Tesla Supply Chain Rumors",
        "NVIDIA AI Chip Demand",
        "Bitcoin Regulation Leaks",
        "Apple VR Headset Sales"
    ]
    
    topic = args.query_flag or args.query or TOPICS[0]
    mode = args.mode_flag or args.mode or "GENERAL"
    
    logger.info(f"🚀 Starting Intelligence Mission: {topic} (Mode: {mode})")
    
    # --- STEP A: CHECK CACHE ---
    # Note: Cache key should ideally include mode, but for now we query based on topic.
    # If mode drastically changes output, we might want to skip cache or include mode in query.
    # For now, let's keep it simple: if mode is GENERAL, use cache. If specialized, maybe skip or check carefully.
    # Actually, let's just use the query. If the user changes mode, they usually change query or we rely on freshness.
    cached_data = check_cache(topic)
    if cached_data:
        if isinstance(cached_data, dict) and "structured_data" not in cached_data:
            risk_score = extract_risk_score(cached_data.get("verdict_text") or cached_data.get("content") or "")
            cached_data["structured_data"] = {
                "sentiment_score": 50,
                "heat_index": 50,
                "impact_score": 50,
                "risk_score": risk_score,
                "sop_based": False,
                "sop_name": "general_consultant",
            }
        # We might want to re-run if we really want a different mode's output. 
        # But assuming the cache is 'good enough' or we just accept it.
        # To strictly support mode, we would need to store mode in DB.
        # For this refactor, let's proceed with cache if found.
        print("---JSON_START---")
        print(json.dumps(cached_data, ensure_ascii=False))
        print("---JSON_END---")
        logger.success("🏆 Mission Accomplished (From Cache).")
        return

    # --- STEP B: GENERATE ---
    # 1. Collect Data
    context = collect_intelligence(topic, mode=mode)
    if not context:
        logger.warning("⚠️ No search results found. Proceeding with model base knowledge analysis.")
    
    # 2. Analyze
    report = analyze_with_llm(topic, context, mode=mode)
    if not report:
        logger.error("❌ Mission Aborted: Analysis Failed.")
        sys.exit(1)
        
    # Construct the strictly required output package
    output_package = {
        "status": "success",
        "report_title": report.get("report_title", ""),
        "verdict_text": report.get("verdict_text", ""),
        "full_markdown_report": report.get("full_markdown_report", ""),
        "mermaid_code": report.get("mermaid_code", ""), # Pure code, no ``` tags
        "debate_details": report.get("debate_details", ""),
        "structured_data": report.get("structured_data", {}),
    }

    # --- STEP C: SAVE (PERSISTENCE) ---
    # 1. Save to 'reports' (The deep storage/cache)
    save_report_to_db(topic, output_package)
    
    # 2. Publish to 'market_news' (The public feed)
    save_to_market_news(topic, report)
    
    # --- STEP D: OUTPUT ---
    print("---JSON_START---")
    print(json.dumps(output_package, ensure_ascii=False))
    print("---JSON_END---")
    
    logger.success("🏆 Mission Accomplished.")

if __name__ == "__main__":
    main()

# Note: Ensure only clean JSON is printed to stdout in main() above. All other logs go to stderr via logger.
