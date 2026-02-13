import requests
import json

BASE_URL = "http://localhost:8000"

def test_health_check():
    """测试健康检查端点"""
    print("=== 测试健康检查端点 ===")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"状态码: {response.status_code}")
        print(f"响应内容: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"错误: {e}")
        return False

def test_brainstorm():
    """测试头脑风暴端点"""
    print("\n=== 测试头脑风暴端点 ===")
    try:
        payload = {
            "product": "Yoga Wear",
            "persona": "College Students"
        }
        response = requests.post(f"{BASE_URL}/api/brainstorm", json=payload)
        print(f"状态码: {response.status_code}")
        print(f"响应内容: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200, response.json()
    except Exception as e:
        print(f"错误: {e}")
        return False, None

def test_analyze(focus_topic):
    """测试分析端点"""
    print("\n=== 测试分析端点 ===")
    try:
        payload = {
            "product": "Yoga Wear",
            "persona": "College Students",
            "focus_topic": focus_topic,
            "fusion_instruction": "FOCUS STRICTLY ON THE INTERSECTION: 'Yoga Wear' used by 'College Students'. Think about: specific pain points for College Students (e.g., budget, durability, space), usage scenarios (e.g., dorm, campus), and aesthetic preferences of College Students.",
            "market": "US",
            "budget": 5000
        }
        response = requests.post(f"{BASE_URL}/api/analyze", json=payload)
        print(f"状态码: {response.status_code}")
        # 只打印结构化数据部分，避免输出过长
        if response.status_code == 200:
            data = response.json()
            print(f"结构化数据: {json.dumps(data.get('structured_data', {}), indent=2, ensure_ascii=False)}")
            print(f"报告长度: {len(data.get('markdown_report', ''))} 字符")
        return response.status_code == 200
    except Exception as e:
        print(f"错误: {e}")
        return False

if __name__ == "__main__":
    # 测试健康检查
    health_ok = test_health_check()
    
    if health_ok:
        # 测试头脑风暴
        brainstorm_ok, brainstorm_result = test_brainstorm()
        
        if brainstorm_ok and brainstorm_result:
            focus_topic = brainstorm_result.get('focus_topic', 'Yoga Wear for College Students')
            print(f"\n使用生成的焦点主题: {focus_topic}")
            # 测试分析
            test_analyze(focus_topic)
        else:
            print("\n头脑风暴测试失败，无法继续测试分析端点")
    else:
        print("\n健康检查失败，服务器可能未运行")
