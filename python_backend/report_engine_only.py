import json
import os
import traceback
from llm_client import call_llm
from dotenv import load_dotenv

load_dotenv()

# 智能环境探测：如果你在本地开发（没有 VERCEL 环境变量），就自动挂上你的本地翻墙代理 
# 这里的 7890 是 Clash 的默认端口，如果你用 v2ray 可能是 10809，请根据实际情况修改 
# 注意：只有当你有本地代理服务器运行时，才需要取消注释以下代码 
# if not os.environ.get("VERCEL"): 
#     print("💻 检测到本地开发环境，已自动挂载本地代理通道...") 
#     os.environ["HTTP_PROXY"] = "http://127.0.0.1:7890" 
#     os.environ["HTTPS_PROXY"] = "http://127.0.0.1:7890" 
# else: 
#     print("☁️ 检测到 Vercel 生产环境，开启海外极速直连模式...")

# Try to initialize Google Generative AI
genai = None
try:
    import google.generativeai as genai
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
        print("✅ Google Generative AI initialized")
    else:
        print("⚠️ Gemini API key not found, skipping Gemini integration")
        genai = None # Ensure it's None if key is missing
except ImportError:
    print("⚠️ Google Generative AI module not installed, skipping Gemini integration")
except Exception as e:
    print(f"⚠️ Failed to initialize Google Generative AI: {e}")
    genai = None

# Try to initialize Supabase client
supabase = None
try:
    from supabase import create_client, Client
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")
    if supabase_url and supabase_key:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Supabase client initialized")
    else:
        print("⚠️ Supabase credentials not found, skipping Supabase integration")
except ImportError:
    print("⚠️ Supabase module not installed, skipping Supabase integration")
except Exception as e:
    print(f"⚠️ Failed to initialize Supabase: {e}")

# ==========================================
# STEP 0: THE SNIPER (Niche Down)
# ==========================================
def generate_focus_topic(product: str, persona: str) -> dict:
    prompt = f"Role: Cross-border E-commerce Strategist. Task: Niche down the broad product '{product}' for the persona '{persona}' into a specific SKU. Output JSON: {{ 'focus_topic': '...', 'target_market': 'US or EU' }}"
    try:
        res = call_llm(prompt, response_format="json")
        return json.loads(res)
    except:
        return {"focus_topic": product, "target_market": "US"}

# ==========================================
# STEP 1: THE GLOBAL RESEARCHER (Gemini Deep Search)
# ==========================================
def generate_deep_research_report(topic: str, market: str) -> str:
    print(f"🌍 [Phase 1] Initiating Gemini Global Deep Research for: {topic} in {market}...")
    
    research_prompt = f"""
    # Role
    你是顶级的跨境电商市场情报官（前麦肯锡合伙人）。你的客户是中国的跨境大卖（Amazon/TikTok/独立站老板）。

    # Task
    目标产品：{topic}
    目标市场：{market}
    请利用你的原生谷歌搜索能力，撰写一篇 2000 字左右的《麦肯锡式·简体中文行业深度调研报告》。

    # Core Philosophy (The CEO Mindset - 5 Fatal Points)
    你必须完全站在跨境企业老板的“生死视角”进行调研。禁止写“流量贵、出单难”等表层废话。你必须重点深挖并量化以下 5 个致命维度：
    1. 合规与侵权红线（致死率 TOP1）：重点检索该品类在目标市场的 FDA/CE 等认证门槛、近期 TRO（商标专利侵权）诉讼风险、平台封号重灾区及潜在罚款金额。
    2. 库存与资金链风险（致死率 TOP2）：重点评估该品类的生命周期、季节性压货风险、预估库存周转天数（DOS）及滞销跌价风险。
    3. 选品试错与内卷成本（致死率 TOP3）：重点检索该品类的同质化竞争烈度、头部垄断份额、是否有真实的利润空间（避免陷入价格战红海）。
    4. 本土化与文化盲区（致死率 TOP4）：重点检索该品类在当地的文化禁忌、营销合规风险（如夸大宣传导致的下架）、审美差异及真实受众痛点。
    5. 供应链与品控崩盘（致死率 TOP5）：重点检索该品类核心差评集中点、退货率风险（高退货率将导致店铺降权关店）、生产交期与材质品控难度。

    # Report Guidelines (必须严格执行)
    1. 跨语种侦察：自行将中文产品名精准翻译为英文，直接检索全网最新英文硬核数据（Amazon US, Reddit, Statista, 权威财报等）。
    2. 数据强迫症：禁止使用“市场很大”，必须给出具体的 CAGR、市场规模、预估退货率、售价区间等量化指标。所有关键数据后必须加上括号引用，如 (Source: Amazon Data 2024)。
    3. 竞品矩阵：必须使用 Markdown 表格，深度对比至少 3 个真实的海外竞品（包含：品牌、售价、核心卖点、致命短板/差评）。
    4. SCQA 结构：必须以 S(情景)-C(冲突)-Q(疑问)-A(答案) 开篇，并且最终给出一个明确的裁决建议。

    OUTPUT: 只输出纯 Markdown 文本，包含 H1, H2, H3 标题。绝对不要输出任何 JSON 或代码块包裹。
    """
    
    # Define fallback function
    def run_fallback(error_msg=""):
        print(f"   ⚠️ Switching to Fallback (LLM Knowledge Base) due to: {error_msg}")
        fallback_prompt = f"Generate a comprehensive market research report for '{topic}' in {market} market. Focus on compliance risks, inventory management, competition, cultural factors, and supply chain issues. Include specific data points and competitor analysis. Output in Markdown format. \n\n(Note: Real-time search failed, use your internal knowledge base to approximate best-practice advice.)"
        try:
            return call_llm(fallback_prompt)
        except Exception as e:
            return f"## Critical System Error\n\nFailed to generate report via both Gemini and Fallback.\nOriginal Error: {error_msg}\nFallback Error: {str(e)}"

    # Attempt Gemini Search
    if genai:
        try:
            # Use Gemini 1.5 Pro with Google Search tool enabled
            model = genai.GenerativeModel('gemini-1.5-pro', tools='google_search_retrieval')
            response = model.generate_content(research_prompt)
            markdown_report = response.text
            print(f"   ✅ [Phase 1] Gemini Report Generated. Length: {len(markdown_report)} chars.")
            return markdown_report
        except Exception as e:
            print(f"   ❌ [Phase 1] Gemini Search Failed: {e}")
            return run_fallback(str(e))
    else:
        return run_fallback("Gemini not initialized (Missing API Key or Module)")

# ==========================================
# STEP 2: THE 6-AGENT JUDGE (JSON Extraction)
# ==========================================
def extract_dashboard_json(report_content: str, topic: str) -> dict:
    print(f"🧠 [Phase 2] 6-Agent Committee extracting structured data...")
    
    judge_prompt = """
    # Role
    You are the NexusPulse Strategic Committee, acting as 6 distinct department heads (Selection, Culture, Pain, Compliance, Supply, Growth).
    
    # Task
    Read the provided "Industry Research Report" and extract/infer structured metrics to power our React Dashboard.
    You must output STRICT JSON. Do not output Markdown.
    
    # JSON OUTPUT FORMAT:
    {
        "verdict": "GO" | "CAUTION" | "KILL",
        "final_summary": "One punchy sentence summarizing the verdict (in Chinese).",
        "narrative": {
            "root": "...", "target_user": "...", "usage_scenario": "...", "core_pain": "...",
            "core_solution": "...", "strategic_moat": "...", "growth_hook": "..."
        },
        "dashboard_agents": {
            "selection": { "score": 85, "title": "内卷成本", "analysis": "Short 1-sentence Chinese insight based on the report." },
            "culture": { "score": 90, "title": "本土盲区", "analysis": "..." },
            "pain": { "urgency": 9.2, "title": "真实痛点", "analysis": "..." },
            "compliance": { "risk": 2, "title": "合规红线", "analysis": "..." },
            "supply": { "dos": 35, "title": "库存周期", "analysis": "..." },
            "growth": { "prob": 80, "title": "盈利空间", "analysis": "..." }
        },
        "charts": {
            "monthly_sentiment": [ {"month": "M1", "sentiment": 80}, {"month": "M2", "sentiment": 85} ],
            "competitor_radar": [
                {"subject": "价格空间", "A": 90, "B": 70, "fullMark": 100},
                {"subject": "合规安全", "A": 85, "B": 90, "fullMark": 100},
                {"subject": "本土化", "A": 60, "B": 95, "fullMark": 100},
                {"subject": "供应链稳定", "A": 95, "B": 50, "fullMark": 100},
                {"subject": "品控退货率", "A": 80, "B": 85, "fullMark": 100}
            ],
            "pain_distribution": [
                {"name": "质量差", "value": 40}, {"name": "太贵", "value": 30}, {"name": "售后差", "value": 20}, {"name": "其他", "value": 10}
            ]
        }
    }
    """
    
    try:
        raw_json = call_llm(f"REPORT CONTENT TO ANALYZE:\n\n{report_content}", system_prompt=judge_prompt, response_format="json")
        data = json.loads(raw_json)
        print("   ✅ [Phase 2] JSON Extraction Successful.")
        return data
    except Exception as e:
        print(f"   ❌ [Phase 2] JSON Extraction Failed: {e}")
        return {}

# ==========================================
# MAIN ORCHESTRATOR
# ==========================================
def analyze_with_llm(components: dict) -> dict:
    topic = components.get("focus_topic", components.get("product", "Unknown Product"))
    market = components.get("target_market", components.get("market", "US"))
    
    try:
        # 1. Pipeline execution
        deep_report = generate_deep_research_report(topic, market)
        dash_data = extract_dashboard_json(deep_report, topic)
        
        # 2. Supabase Storage
        if len(deep_report) > 100 and supabase:
            try:
                supabase.table('reports').insert({
                    "topic": topic,
                    "market": market,
                    "content": deep_report,
                    "meta_json": dash_data.get('dashboard_agents', {})
                }).execute()
                print(f"   💾 Saved to Supabase successfully.")
            except Exception as db_err:
                print(f"   ❌ Supabase Save Failed: {db_err}")

        # 3. Build Mermaid Blueprint (The Logic Spine)
        nav = dash_data.get('narrative', {})
        verdict = dash_data.get('verdict', 'CAUTION')
        color = "#22c55e" if verdict == "GO" else ("#ef4444" if verdict == "KILL" else "#eab308")
        
        mermaid = f"""graph TD
            classDef spine fill:#000,stroke:#fff,stroke-width:2px,color:#fff,font-size:20px,font-weight:bold;
            classDef final fill:{color},stroke:#fff,stroke-width:4px,color:#000,font-size:24px,font-weight:black;
            Root(("{topic[:20]}...")) ==> Target["👤 {nav.get('target_user', 'User')}"] ==> Scene["🏙️ {nav.get('usage_scenario', 'Context')}"] ==> Pain["🔥 {nav.get('core_pain', 'Pain')}"] ==> Sol["🛠️ {nav.get('core_solution', 'Solution')}"] ==> Moat["🛡️ {nav.get('strategic_moat', 'Moat')}"] ==> Hook["🎣 {nav.get('growth_hook', 'Hook')}"] ==> End>🏁 {verdict}]
            class Root,Target,Scene,Pain,Sol,Moat,Hook spine; class End final;
            linkStyle default stroke:{color},stroke-width:3px;"""
            
        return {
            "structured_data": {
                "verdict": verdict,
                "final_summary": dash_data.get('final_summary', ''),
                "agents": dash_data.get('dashboard_agents', {}),
                "charts": dash_data.get('charts', {}),
                "mermaid_code": mermaid,
                "news": [],
                "full_report": deep_report
            }
        }
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}
