from dotenv import load_dotenv 
import os 
from tavily import TavilyClient 

# 1. 加载环境变量 
load_dotenv() 

# 2. 获取 Key 
api_key = os.getenv("TAVILY_API_KEY") 
print(f"🔑 Current API Key: {api_key}") # 看看打印出来是不是 None 

if not api_key: 
    print("❌ Error: TAVILY_API_KEY not found in .env") 
else: 
    try: 
        # 3. 尝试搜索 
        client = TavilyClient(api_key=api_key) 
        response = client.search("latest AI keyboard trends") 
        print("✅ Success! Found data:", response['results'][0]['title']) 
    except Exception as e: 
        print(f"❌ API Error: {e}")