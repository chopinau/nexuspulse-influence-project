from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# --- PATH CONFIGURATION ---
# In Vercel, the function runs in a specific directory.
# We need to make sure 'python_backend' is in sys.path.
print(f"DEBUG: Current working directory: {os.getcwd()}")
print(f"DEBUG: Directory contents: {os.listdir(os.getcwd())}")

# Method 1: Check if 'python_backend' exists in current dir (if copied by includeFiles)
python_backend_path = os.path.join(os.getcwd(), 'python_backend')
if os.path.exists(python_backend_path):
    print(f"DEBUG: Found python_backend at: {python_backend_path}")
    sys.path.append(python_backend_path)
# Method 2: Check relative path (standard dev env)
else:
    python_backend_path = os.path.join(os.path.dirname(__file__), '..', 'python_backend')
    print(f"DEBUG: Trying python_backend at: {python_backend_path}")
    print(f"DEBUG: Does this path exist? {os.path.exists(python_backend_path)}")
    if os.path.exists(python_backend_path):
        sys.path.append(python_backend_path)
    else:
        print(f"DEBUG: python_backend not found at either location")

print(f"DEBUG: sys.path: {sys.path}")

# --- IMPORTS ---
try:
    from report_engine_only import analyze_with_llm, collect_intelligence, fetch_market_news, save_report_to_db, save_to_market_news, check_memory_cache, store_intel
    print("DEBUG: Import successful!")
except ImportError as e:
    # Fallback for debugging import errors
    print(f"IMPORT ERROR: {e}")
    print(f"CWD: {os.getcwd()}")
    print(f"LS: {os.listdir(os.getcwd())}")
    # Try to import individual modules
    try:
        import report_engine_only
        print("DEBUG: Could import report_engine_only module, but not all functions")
        print(f"DEBUG: Module attributes: {dir(report_engine_only)}")
    except ImportError as e2:
        print(f"DEBUG: Could not import report_engine_only module at all: {e2}")
    raise e

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            body = json.loads(post_data.decode('utf-8'))
            topic = body.get('topic')
            mode = body.get('mode', 'GENERAL')
            
            if not topic:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Topic is required"}).encode('utf-8'))
                return

            # 1. Check Cache
            cached_data = check_memory_cache(topic)
            if cached_data:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(cached_data).encode('utf-8'))
                return

            # 2. Collect Data
            context = collect_intelligence(topic, mode=mode)
            news_data = fetch_market_news(topic)
            if news_data:
                news_context = "\n\n=== 📰 LATEST MARKET NEWS (LIVE) ===\n"
                for item in news_data:
                    news_context += f"- [{item.get('source', 'News')}] {item.get('title')} (Sentiment: {item.get('sentiment')})\n"
                context += news_context

            # 3. Analyze
            inventory_data = None
            if body.get('inventory') is not None and body.get('daily_sales') is not None:
                inventory_data = [{'sku': 'Main-Product', 'stock': body.get('inventory'), 'daily_sales': body.get('daily_sales')}]

            report = analyze_with_llm(topic, context, mode=mode,
                                    inventory_data=inventory_data,
                                    listing_text=body.get('listing_text'),
                                    pain_point=body.get('pain_point'),
                                    product_name=topic)
            
            if not report:
                raise Exception("Analysis failed")

            output_package = {
                "status": "success",
                "report_title": report.get("report_title", ""),
                "verdict_text": report.get("verdict_text", ""),
                "full_markdown_report": report.get("full_markdown_report", ""),
                "mermaid_code": report.get("mermaid_code", ""),
                "debate_details": report.get("debate_details", ""),
                "structured_data": report.get("structured_data", {}),
                "visualization_data": report.get("visualization_data", {}),
                "market_news": news_data
            }

            # 4. Save
            store_intel(topic, output_package, mode=mode)
            save_report_to_db(topic, output_package)
            save_to_market_news(topic, output_package)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(output_package).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
