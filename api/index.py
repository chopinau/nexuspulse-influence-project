from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# --- PATH CONFIGURATION ---
# In Vercel, the function runs in a specific directory.
# We need to make sure 'python_backend' is in sys.path.

# Method 1: Check if 'python_backend' exists in current dir (if copied by includeFiles)
python_backend_path = os.path.join(os.getcwd(), 'python_backend')
if os.path.exists(python_backend_path):
    sys.path.append(python_backend_path)
# Method 2: Check relative path (standard dev env)
else:
    python_backend_path = os.path.join(os.path.dirname(__file__), '..', 'python_backend')
    if os.path.exists(python_backend_path):
        sys.path.append(python_backend_path)
    else:
        # Fallback: try to find it relative to current file if os.getcwd() is different
        python_backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'python_backend')
        if os.path.exists(python_backend_path):
            sys.path.append(python_backend_path)
        else:
            # print(f"Warning: python_backend directory not found. sys.path: {sys.path}, os.getcwd: {os.getcwd()}")
            pass

# --- IMPORTS ---
try:
    from report_engine_only import analyze_with_llm
except ImportError as e:
    # raise ImportError(f"Failed to import report_engine_only: {e}. sys.path: {sys.path}")
    pass

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            body = json.loads(post_data.decode('utf-8'))
            topic = body.get('topic')
            
            # Use 'market' from frontend or default to 'US'
            market = body.get('market', 'US')
            
            # For backward compatibility or if frontend sends 'product' instead of 'topic'
            if not topic and 'product' in body:
                topic = body['product']

            if not topic:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Topic is required"}).encode('utf-8'))
                return

            # Call the new analyze_with_llm which handles the 2-step pipeline
            # It expects a dictionary with keys like 'focus_topic', 'target_market' etc.
            # But the new signature in report_engine_only.py is: analyze_with_llm(components: dict)
            # So we wrap our input into a dict.
            
            input_components = {
                "focus_topic": topic,
                "target_market": market,
                # Pass other potential fields if needed
                "product": topic, 
                "market": market
            }

            # Execute the analysis
            result = analyze_with_llm(input_components)
            
            if not result or "error" in result:
                error_msg = result.get("error", "Analysis failed") if result else "Analysis failed"
                raise Exception(error_msg)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    # Handle OPTIONS for CORS if needed (though Next.js rewrites usually handle this)
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        self.end_headers()
