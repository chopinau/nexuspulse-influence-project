import json
from report_engine_only import analyze_with_ruthless_executive, generate_ceo_report

# Mock the LLM call to avoid spending tokens (or use real one if configured)
# For this test, we assume analyze_with_llm calls the real LLM or a mock.
# If you want to test the LOGIC flow, we can simulate the inputs.

def run_test():
    print("🚀 Starting NexusPulse Logic Test...\n")

    # Case 1: High Risk Scenario (Should Trigger VETO)
    print("--- TEST CASE 1: High Risk Product (Anti-bacterial without FDA) ---")
    risky_components = {
        "product": "Anti-bacterial Yoga Mat",
        "market": "US",
        "budget": 5000,
        "channel": "TikTok"
    }
    
    try:
        # Run the engine
        result = analyze_with_ruthless_executive(risky_components)
        
        # Generate the Report
        report = generate_ceo_report(result)
        
        print(f"Verdict: {result['ceo']['verdict']}")
        print(f"Risk Score: {result['compliance']['risk_score']}")
        print(f"Is Fatal: {result['compliance']['is_fatal']}")
        print("\n[Generated Report Preview]:")
        print(report[:300] + "...") # Print first 300 chars
        
    except Exception as e:
        print(f"❌ Test Failed: {e}")

    print("\n" + "="*50 + "\n")

    # Case 2: Healthy Scenario
    print("--- TEST CASE 2: Healthy Product (Standard Yoga Mat) ---")
    healthy_components = {
        "product": "Eco-friendly Cork Yoga Mat",
        "market": "US",
        "budget": 50000,
        "channel": "TikTok"
    }
    
    try:
        result = analyze_with_ruthless_executive(healthy_components)
        report = generate_ceo_report(result)
        
        print(f"Verdict: {result['ceo']['verdict']}")
        print(f"Risk Score: {result['compliance']['risk_score']}")
        print("\n[Generated Report Preview]:")
        print(report[:300] + "...")
        
    except Exception as e:
        print(f"❌ Test Failed: {e}")

if __name__ == "__main__":
    run_test()