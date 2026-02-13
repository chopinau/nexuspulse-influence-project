import json
import os
import traceback
import concurrent.futures
from tavily import TavilyClient
from llm_client import call_llm
from dotenv import load_dotenv

load_dotenv()
tavily_client = TavilyClient(api_key=os.environ.get("TAVILY_API_KEY"))

# === 1. DORK LIBRARY (UNCHANGED) ===
DORK_LIBRARY = {
    "compliance": {
        "US": "site:cpsc.gov recalls OR site:fda.gov regulations OR site:ftc.gov 'false advertising'",
        "EU": "site:ec.europa.eu 'CE marking' OR site:rfs.europa.eu 'safety recall'",
        "SEA": "site:sirim.my certification OR site:kemenperin.go.id SNI",
        "GLOBAL": "site:iso.org safety standards regulations"
    },
    "selection": {
        "GLOBAL": "site:amazon.com 'best seller' 'customer reviews' OR site:ebay.com 'sold listings' price",
        "SEA": "site:shopee.com 'sold' price OR site:lazada.com reviews"
    },
    "pain": {
        "GLOBAL": "site:reddit.com 'waste of money' OR 'stopped working' OR 'scam' -site:promotions",
        "EU": "site:trustpilot.com reviews complaints problems"
    },
    "supply": {
        "GLOBAL": "site:alibaba.com 'FOB Price' MOQ OR site:made-in-china.com manufacturer factory",
        "LOGISTICS": "site:amazon.com 'product dimensions' 'item weight' shipping"
    },
    "growth": {
        "GLOBAL": "site:tiktok.com/tag viral trends OR site:youtube.com 'unboxing' review views"
    },
    "culture": {
        "GLOBAL": "cultural taboos symbolism mistakes marketing"
    }
}

def generate_focus_topic(product: str, persona: str) -> dict:
    prompt = f"Role: Product Strategist. Task: Niche down '{product}' for '{persona}' into a specific SKU. Output JSON: {{ 'focus_topic': '...', 'target_market': 'US' }}"
    try:
        res = call_llm(prompt, response_format="json")
        return json.loads(res)
    except:
        return {"focus_topic": product, "target_market": "US"}

# === 2. PARALLEL SEARCH ENGINE (UNCHANGED) ===
def fetch_agent_data(agent_name: str, topic: str, market: str):
    try:
        dorks = DORK_LIBRARY.get(agent_name, {})
        query_template = dorks.get(market, dorks.get("GLOBAL", ""))
        final_query = f"{topic} {query_template}"
        print(f"   🚀 [{agent_name}] Searching: {final_query[:30]}...")
        response = tavily_client.search(query=final_query, search_depth="advanced", max_results=3)
        return f"\n=== {agent_name.upper()} INTEL ===\n" + "\n".join([f"- {r['title']}: {r['content'][:300]}" for r in response['results']])
    except:
        return ""

def get_market_intel(topic: str, market: str) -> dict:
    print(f"🔍 Omni-Scan: {topic} [{market}]")
    agents = ["compliance", "selection", "pain", "supply", "growth", "culture"]
    full_context = ""
    all_news = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        future_to_agent = {executor.submit(fetch_agent_data, agent, topic, market): agent for agent in agents}
        for future in concurrent.futures.as_completed(future_to_agent):
            full_context += future.result()

    try:
        news_res = tavily_client.search(query=f"{topic} market news reviews {market}", max_results=6)
        all_news = news_res['results']
    except:
        pass
            
    return {"context": full_context[:25000], "news": all_news}

# === 3. LOGIC MAPPED ANALYSIS ===
def analyze_with_llm(components: dict) -> dict:
    topic = components.get("focus_topic")
    market = components.get("target_market", "US")
    intel = get_market_intel(topic, market)
    
    system_prompt = """
    ROLE: NexusPulse Strategic Council. 
    TASK: Analyze the product using the 6-Agent Framework, then synthesize a 'CEO Chain of Thought'.
    
    STEP 1: AGENT ANALYSIS (Detailed)
    - Selection: Define precise niche & competitors.
    - Culture: Define target persona & taboos.
    - Pain: Find top user complaint.
    - Supply: Define core feature & logistics.
    - Compliance: Check regulations.
    - Growth: Define viral hook.

    STEP 2: NARRATIVE SPINE (Synthesis)
    - You must extract the narrative nodes DIRECTLY from the agents above.
    - **Who**: Extracted from Culture Agent (Target Persona).
    - **Scenario**: Extracted from Pain Agent (Usage Context).
    - **Pain**: Extracted from Pain Agent (Top Complaint).
    - **Solution**: Extracted from Supply/Selection Agent (Key Feature).
    - **Hook**: Extracted from Growth Agent (Marketing Angle).
    - DO NOT INVENT NEW CONCEPTS. Use the exact keywords found in Step 1.
    
    OUTPUT JSON (STRICT):
    {
        "verdict": "GO" | "CAUTION" | "KILL",
        "final_summary": "Strategic imperative.",
        "narrative": {
            "root": "The Precise Niche Product",
            "who": "Target Persona (Max 4 words)",
            "scenario": "Usage Context (Max 4 words)",
            "pain": "Core Pain Point (Max 4 words)",
            "solution": "Killer Feature (Max 4 words)",
            "moat": "Defensive Moat (Max 4 words)",
            "hook": "Marketing Hook (Max 4 words)"
        },
        "agents": {
            "selection": { "score": 8.5, "title": "Niche", "analysis": "..." },
            "culture": { "score": 90, "title": "Fit", "taboo_risk": "...", "analysis": "..." },
            "pain": { "urgency": 9.2, "title": "Pain", "top_pain": "...", "solution_rate": 88, "analysis": "..." },
            "compliance": { "risk": 2, "title": "Risk", "red_lines": 0, "fix_cost": "$0", "red_line_reason": "...", "analysis": "..." },
            "supply": { "dos": 35, "title": "Supply", "cliff_risk": "Low", "analysis": "..." },
            "growth": { "prob": 80, "title": "Growth", "tiktok_hook": "...", "analysis": "..." }
        },
        "competitors": [ {"name": "...", "price": "...", "weakness": "..."} ]
    }
    """
    
    try:
        user_prompt = f"Product: {topic}\nMarket: {market}\n\nINTEL:\n{intel['context']}"
        raw = call_llm(user_prompt, system_prompt=system_prompt, response_format="json")
        data = json.loads(raw)
        
        # === THE LOGIC-MAPPED MERMAID ===
        nav = data.get('narrative', {})
        verdict = data.get('verdict')
        color = "#22c55e" if verdict == "GO" else ("#ef4444" if verdict == "KILL" else "#eab308")

        mermaid = f"""
        graph TD
            %% Base Classes - CLEAN & LARGE
            classDef spine fill:#000,stroke:#fff,stroke-width:2px,color:#fff,font-size:20px,font-weight:bold;
            classDef context fill:#111,stroke:#666,stroke-width:1px,color:#aaa,stroke-dasharray: 5 5,font-size:16px;
            classDef final fill:{color},stroke:#fff,stroke-width:4px,color:#000,font-size:24px,font-weight:black;

            %% The Narrative Spine
            Root(("{nav.get('root', topic)[:20]}..."))
            Target["👤 {nav.get('who', 'User')}"]
            Scene["🏙️ {nav.get('scenario', 'Context')}"]
            Pain["🔥 {nav.get('pain', 'Pain')}"]
            Sol["🛠️ {nav.get('solution', 'Solution')}"]
            Moat["🛡️ {nav.get('moat', 'Moat')}"]
            Hook["🎣 {nav.get('hook', 'Hook')}"]
            End>🏁 {verdict}]

            %% Logic Flow
            Root ==> Target
            Target -.-> Scene
            Scene ==> Pain
            Pain ==> Sol
            Sol --> Moat
            Moat ==> Hook
            Hook ==> End

            %% Styling
            class Root,Target,Pain,Sol,Moat,Hook spine;
            class Scene context;
            class End final;
            
            %% Link Styling
            linkStyle 0,2,3,5,6 stroke:{color},stroke-width:3px;
            linkStyle 1,4 stroke:#666,stroke-width:1px,stroke-dasharray: 5 5;
        """
        
        deep_report = generate_deep_report(data, topic)
        
        return {
            "structured_data": {
                "verdict": verdict,
                "final_summary": data['final_summary'],
                "agents": data['agents'],
                "competitors": data.get('competitors', []),
                "mermaid_code": mermaid,
                "news": intel['news'],
                "full_report": deep_report
            },
            "markdown_report": deep_report
        }
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}

def generate_deep_report(data, topic):
    ag = data['agents']
    nav = data.get('narrative', {})
    
    return f"""
# 🚀 跨境六维深度研报：{topic}
## 1. 🏁 CEO 最终裁决：{data.get('verdict')}
> **战略定调**：{data.get('final_summary')}

---

## 📖 战略叙事主线 (Strategic Spine)
* **核心用户**：{nav.get('who', 'N/A')}
* **场景痛点**：{nav.get('scenario', 'N/A')} -> {nav.get('pain', 'N/A')}
* **破局方案**：{nav.get('solution', 'N/A')}
* **增长钩子**：{nav.get('hook', 'N/A')}

---

## 2. 🧬 智能选品局 (The Sniper)
* **差异化得分**：**{ag['selection'].get('score', 0)}/10**
* **深度分析**：{ag['selection'].get('analysis', '')}

## 3. 🌍 文化适配局 (The Localizer)
* **文化契合度**：**{ag['culture'].get('score', 0)}%**
* **深度分析**：{ag['culture'].get('analysis', '')}

## 4. 🤕 痛点挖掘局 (The Pain Killer)
* **Top1 痛点**：{ag['pain'].get('top_pain', 'N/A')}
* **深度分析**：{ag['pain'].get('analysis', '')}

## 5. 🛡️ 合规风控局 (The Gatekeeper)
* **风险指数**：**{ag['compliance'].get('risk', 0)}/10**
* **致命红线**：{ag['compliance'].get('red_lines', 0)} 项触发
* **深度分析**：{ag['compliance'].get('analysis', '')}

## 6. 💰 供应链与资金局 (The CFO)
* **DOS (库存周转)**：**{ag['supply'].get('dos', 0)} 天**
* **库存悬崖风险**：{ag['supply'].get('cliff_risk', 'Unknown')}
* **深度分析**：{ag['supply'].get('analysis', '')}

## 7. 📈 营销增长局 (The Growth Hacker)
* **TikTok Hook**：`{ag['growth'].get('tiktok_hook', 'N/A')}`
* **深度分析**：{ag['growth'].get('analysis', '')}
"""
