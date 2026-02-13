import requests
import json

print("Testing FastAPI server...")

# Test 1: Health check
try:
    response = requests.get('http://localhost:8000/')
    print(f"Health check status code: {response.status_code}")
    print(f"Health check response: {response.json()}")
except Exception as e:
    print(f"Health check failed: {e}")

print("\n" + "="*50 + "\n")

# Test 2: Brainstorm endpoint
try:
    data = {
        "product": "Makeup Tool",
        "persona": "Student"
    }
    response = requests.post('http://localhost:8000/api/brainstorm', json=data)
    print(f"Brainstorm status code: {response.status_code}")
    print(f"Brainstorm response: {response.json()}")
except Exception as e:
    print(f"Brainstorm failed: {e}")
