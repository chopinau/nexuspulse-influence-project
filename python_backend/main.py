import os
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from report_engine_only import generate_focus_topic, analyze_with_llm

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

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

class Req(BaseModel):
    product: str
    persona: str = "General"
    market: str = "US"
    focus_topic: str = ""

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
        
        # Prepare the record
        record = {
            "topic": topic,
            "persona": persona,
            "verdict": verdict,
            "report_markdown": report_markdown,
            "structured_data": structured_data
            # Note: You might want to add a 'market' column to your Supabase table later
        }
        
        # Insert into 'reports' table
        response = supabase.table("reports").insert(record).execute()
        print(f"✅ Report saved to Supabase: {response}")
    except Exception as e:
        print(f"❌ Failed to save report to Supabase: {e}")

@app.post("/api/brainstorm")
async def bs(r: Req):
    return generate_focus_topic(r.product, r.persona)

@app.post("/api/analyze")
async def az(r: Req, background_tasks: BackgroundTasks):
    data = r.dict()
    data['target_market'] = r.market
    
    # Run the analysis
    result = analyze_with_llm(data)
    
    # Save to Supabase in the background
    background_tasks.add_task(save_report_to_supabase, result, r.focus_topic, r.persona, r.market)
    
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
