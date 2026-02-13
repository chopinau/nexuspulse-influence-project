import sys
import os

# Add the python_backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'python_backend'))

from python_backend.report_engine_only import analyze_with_llm, generate_focus_topic

def test_analyze_with_llm():
    print("Testing analyze_with_llm function...")
    
    try:
        # Test with a simple topic
        result = analyze_with_llm(
            topic="TWS Earbuds",
            context="Market analysis for TWS Earbuds in outdoor sport market",
            mode="GENERAL",
            strategy_mode="incubation"
        )
        
        if result:
            print("✅ Success! analyze_with_llm returned:")
            print(f"   Report Title: {result.get('report_title')}")
            print(f"   Content Preview: {result.get('content', '')[:100]}...")
        else:
            print("❌ Failure! analyze_with_llm returned None")
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        import traceback
        traceback.print_exc()

def test_generate_focus_topic():
    print("\nTesting generate_focus_topic function...")
    
    try:
        # Test with Makeup Tool + Student
        result = generate_focus_topic("Makeup Tool", "Student")
        
        if result:
            print("✅ Success! generate_focus_topic returned:")
            print(f"   Focus Topic: {result.get('focus_topic')}")
            print(f"   Reasoning: {result.get('reasoning')}")
        else:
            print("❌ Failure! generate_focus_topic returned None")
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_analyze_with_llm()
    test_generate_focus_topic()
