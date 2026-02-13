from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import sys
import os

# Ensure the current directory is in the path to import report_engine_only
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from report_engine_only import generate_focus_topic, analyze_with_llm, generate_ceo_report

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/api/brainstorm', methods=['POST'])
def brainstorm():
    try:
        data = request.json
        product = data.get('product')
        persona = data.get('persona', 'General')
        
        logger.info(f"🧠 Brainstorm request: {product} for {persona}")
        
        result = generate_focus_topic(product, persona)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in brainstorm: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        # components expected by analyze_with_llm:
        # product, persona, focus_topic, fusion_instruction
        
        logger.info(f"🚀 Analyze request: {data.get('focus_topic')}")
        
        # 1. Run Analysis
        decision_data = analyze_with_llm(data)
        
        # 2. Generate Markdown Report
        markdown_report = generate_ceo_report(decision_data)
        
        # 3. Construct Response
        response = {
            "markdown_report": markdown_report,
            "structured_data": decision_data
        }
        
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error in analyze: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 NexusPulse Intelligence Server running on http://localhost:8000")
    app.run(port=8000, debug=True)
