import os

file_path = r"D:\my-web-app\BettaFish\config.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

search_str = 'JSON_ERROR_LOG_DIR: str = Field("logs/json_errors", description="JSON解析错误日志目录")'
replace_str = """JSON_ERROR_LOG_DIR: str = Field("logs/json_errors", description="JSON解析错误日志目录")
    CHAPTER_JSON_MAX_ATTEMPTS: int = Field(3, description="章节JSON生成最大尝试次数")"""

if search_str in content and "CHAPTER_JSON_MAX_ATTEMPTS" not in content:
    new_content = content.replace(search_str, replace_str)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully patched config.py with CHAPTER_JSON_MAX_ATTEMPTS")
else:
    print("Config already patched or search string not found")
