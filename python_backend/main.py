import os
from typing import Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from report_engine_only import generate_focus_topic, analyze_with_llm

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def read_root():
    return {"status": "NexusPulse Backend is running on Vercel!"}

# Try to initialize Supabase Client
supabase = None
try:
    from supabase import create_client, Client
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if url and key:
        supabase: Client = create_client(url, key)
        print("✅ Supabase client initialized")
    else:
        print("⚠️ Supabase credentials not found, skipping Supabase integration")
except ImportError:
    print("⚠️ Supabase module not installed, skipping Supabase integration")
except Exception as e:
    print(f"⚠️ Failed to initialize Supabase: {e}")

# Try to initialize Feishu Client
feishu_client = None
try:
    from feishu_client import create_feishu_client_from_env, FeishuClientError
    feishu_client = create_feishu_client_from_env()
    if feishu_client:
        print("✅ Feishu client initialized")
    else:
        print("⚠️ Feishu credentials not found, skipping Feishu integration")
except ImportError as e:
    print(f"⚠️ Feishu client module not installed: {e}")
except Exception as e:
    print(f"⚠️ Failed to initialize Feishu client: {e}")

class Req(BaseModel):
    product: str
    persona: str = "General"
    market: str = "US"
    focus_topic: str = ""
    table_id: Optional[str] = None

def save_report_to_supabase(data: dict, topic: str, persona: str, market: str):
    """
    Saves the generated report and structured data to Supabase.
    """
    if not supabase:
        print("⚠️ Skipping Supabase save: client not initialized")
        return
    
    try:
        verdict = data.get("structured_data", {}).get("verdict", "Unknown")
        report_markdown = data.get("markdown_report", "")
        structured_data = data.get("structured_data", {})
        
        record = {
            "topic": topic,
            "persona": persona,
            "verdict": verdict,
            "report_markdown": report_markdown,
            "structured_data": structured_data
        }
        
        response = supabase.table("reports").insert(record).execute()
        print(f"✅ Report saved to Supabase: {response}")
    except Exception as e:
        print(f"❌ Failed to save report to Supabase: {e}")

def save_report_to_feishu_bg(data: dict, query: str, app_token: str, table_id: str):
    """
    Background task to save report to Feishu (Data Flywheel).
    """
    if not feishu_client:
        print("⚠️ Skipping Feishu save: client not initialized")
        return
    
    try:
        structured_data = data.get("structured_data", {})
        report_data = {
            "query": query,
            "verdict": structured_data.get("verdict", "UNKNOWN"),
            "final_summary": structured_data.get("final_summary", ""),
            "dashboard_agents": structured_data.get("dashboard_agents", {}),
            "markdown_report": structured_data.get("deep_report_markdown", "") or structured_data.get("full_report", "")
        }
        
        success = feishu_client.save_report_to_feishu(
            app_token=app_token,
            table_id=table_id,
            report_data=report_data
        )
        
        if success:
            print(f"✅ Report saved to Feishu Data Flywheel: {query}")
        else:
            print(f"⚠️ Failed to save report to Feishu")
    except Exception as e:
        print(f"❌ Feishu save error: {e}")

@app.post("/api/brainstorm")
async def bs(r: Req):
    return generate_focus_topic(r.product, r.persona)

@app.post("/api/analyze")
async def az(r: Req, background_tasks: BackgroundTasks):
    data = r.dict()
    data['target_market'] = r.market
    
    feishu_context = ""
    if r.table_id and feishu_client:
        app_token = os.environ.get("FEISHU_APP_TOKEN")
        if app_token:
            try:
                feishu_context = feishu_client.fetch_table_records(
                    app_token=app_token,
                    table_id=r.table_id,
                    limit=50
                )
                print(f"✅ Fetched Feishu data for table: {r.table_id}")
            except Exception as e:
                print(f"⚠️ Failed to fetch Feishu data: {e}")
                feishu_context = f"【飞书数据获取失败】错误: {str(e)}"
        else:
            print("⚠️ FEISHU_APP_TOKEN not configured")
    
    result = analyze_with_llm(data, feishu_context=feishu_context)
    
    background_tasks.add_task(save_report_to_supabase, result, r.focus_topic, r.persona, r.market)
    
    feishu_report_table_id = os.environ.get("FEISHU_REPORT_TABLE_ID")
    feishu_app_token = os.environ.get("FEISHU_APP_TOKEN")
    if feishu_client and feishu_app_token and feishu_report_table_id:
        query = r.focus_topic or r.product
        background_tasks.add_task(
            save_report_to_feishu_bg, 
            result, 
            query, 
            feishu_app_token, 
            feishu_report_table_id
        )
    
    return result

@app.get("/api/feishu/tables")
async def get_feishu_tables():
    """
    Fetch all tables from the configured Feishu Bitable.
    
    Returns a list of tables with table_id and name for frontend dropdown.
    """
    if not feishu_client:
        raise HTTPException(
            status_code=503,
            detail="Feishu client not initialized. Please check FEISHU_APP_ID and FEISHU_APP_SECRET environment variables."
        )
    
    app_token = os.environ.get("FEISHU_APP_TOKEN")
    if not app_token:
        raise HTTPException(
            status_code=503,
            detail="FEISHU_APP_TOKEN not configured. Please set the FEISHU_APP_TOKEN environment variable."
        )
    
    try:
        tables = feishu_client.get_all_tables(app_token)
        return {"tables": tables}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch tables from Feishu: {str(e)}"
        )

@app.get("/api/feishu/status")
async def get_feishu_status():
    """
    Check Feishu integration status.
    
    Returns whether Feishu client is properly configured.
    """
    return {
        "feishu_enabled": feishu_client is not None,
        "app_token_configured": bool(os.environ.get("FEISHU_APP_TOKEN")),
        "app_id_configured": bool(os.environ.get("FEISHU_APP_ID")),
        "app_secret_configured": bool(os.environ.get("FEISHU_APP_SECRET"))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
