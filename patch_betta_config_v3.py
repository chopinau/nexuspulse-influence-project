import os

file_path = r"D:\my-web-app\BettaFish\config.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

search_str = 'DOCUMENT_IR_OUTPUT_DIR: str = Field("final_reports/ir", description="文档中间表示输出目录")'
replace_str = """DOCUMENT_IR_OUTPUT_DIR: str = Field("final_reports/ir", description="文档中间表示输出目录")

    TEMPLATE_DIR: str = Field("ReportEngine/report_template", description="报告模板目录")
    JSON_ERROR_LOG_DIR: str = Field("logs/json_errors", description="JSON解析错误日志目录")"""

if search_str in content and "TEMPLATE_DIR" not in content:
    new_content = content.replace(search_str, replace_str)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully patched config.py with TEMPLATE_DIR")
else:
    print("Config already patched or search string not found")
