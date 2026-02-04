import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// Force dynamic to prevent static optimization
export const dynamic = 'force-dynamic';

const PYTHON_TIMEOUT = 60000; // 60 seconds timeout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Resolve path to the python script
    // Assuming the script is at python_backend/report_engine_only.py relative to project root
    const scriptPath = path.resolve(process.cwd(), 'python_backend', 'report_engine_only.py');
    
    // Command: python python_backend/report_engine_only.py --query "topic"
    // Using 'python' assumes it's in the PATH. In some envs might be 'python3'
    const pythonProcess = spawn('python', [scriptPath, '--query', topic]);

    let outputData = '';
    let errorData = '';

    // Collect stdout
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    // Collect stderr
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      // Log stderr to console for server-side debugging
      console.error(`[Python stderr]: ${data}`);
    });

    // Wait for process to close with timeout
    const exitCode = await new Promise((resolve) => {
      let timeoutId: NodeJS.Timeout;

      // Set timeout
      timeoutId = setTimeout(() => {
        console.error('Python script timed out');
        pythonProcess.kill();
        resolve(1); // Return error code
      }, PYTHON_TIMEOUT);

      pythonProcess.on('close', (code) => {
        clearTimeout(timeoutId);
        resolve(code);
      });
    });

    // Even if exit code is non-zero, try to return a meaningful response
    // This ensures we don't get 500 errors even if search fails
    if (exitCode !== 0) {
      console.error(`Python script exited with code ${exitCode}`);
      return NextResponse.json(
        {
          status: 'error',
          report_title: `关于 ${topic} 的分析报告`,
          verdict_text: '报告生成失败',
          full_markdown_report: `# 关于 ${topic} 的深度战略研判\n\n## 📋 核心结论\n> 决策建议：报告生成失败\n> \n> 后端处理过程中出现错误。\n\n## ⚖️ 多空博弈\n分析失败\n\n## 📊 数据支持\n无数据\n\n## 💡 行动建议\n1. [P1] 重要：请尝试更换关键词\n2. [P2] 次要：稍后再试\n3. [P3] 常规：检查网络连接\n\n## 🔄 逻辑流程图\n\n\`\`\`mermaid\ngraph TD\n    Start[开始分析] --> Error[分析失败]\n    Error --> Retry[建议重试]\n\`\`\``,
          debate_details: '分析失败',
          mermaid_code: 'graph TD\n    Start[开始分析] --> Error[分析失败]\n    Error --> Retry[建议重试]',
          structured_data: {
            sentiment_score: 50,
            heat_index: 0,
            impact_score: 0,
            sop_based: false,
            sop_name: 'general_consultant'
          }
        },
        { status: 200 } // Return 200 instead of 500 to avoid frontend errors
      );
    }

    // Extract JSON from Python output
    let jsonOutput = null;
    try {
      // 1. Try to extract using explicit delimiters (Most Robust)
      const delimiterMatch = outputData.match(/---JSON_START---([\s\S]*?)---JSON_END---/);
      if (delimiterMatch && delimiterMatch[1]) {
        jsonOutput = JSON.parse(delimiterMatch[1].trim());
      } 
      // 2. Fallback: Try to find JSON object using regex (if delimiters missing)
      else {
        console.warn("Delimiters not found, falling back to regex extraction");
        // Use a balanced brace matching approach or just last valid JSON
        // Simple regex often fails on nested objects, so we try to find the largest block
        const jsonMatches = outputData.match(/\{[\s\S]*\}/); // Greedy match from first { to last }
        if (jsonMatches) {
          jsonOutput = JSON.parse(jsonMatches[0]);
        }
      }
    } catch (e) {
      console.error('Failed to extract JSON from Python output:', e);
    }

    // Return the extracted JSON or a standardized error response
    if (jsonOutput) {
      return NextResponse.json(jsonOutput);
    } else {
      return NextResponse.json({
        status: 'error',
        report_title: `关于 ${topic} 的分析报告`,
        verdict_text: '报告生成失败',
        full_markdown_report: `# 关于 ${topic} 的深度战略研判\n\n## 📋 核心结论\n> 决策建议：报告生成失败\n> \n> 无法从后端获取有效的分析结果。\n\n## ⚖️ 多空博弈\n分析失败\n\n## 📊 数据支持\n无数据\n\n## 💡 行动建议\n1. [P1] 重要：请尝试更换关键词\n2. [P2] 次要：稍后再试\n3. [P3] 常规：检查网络连接\n\n## 🔄 逻辑流程图\n\n\`\`\`mermaid\ngraph TD\n    Start[开始分析] --> Error[分析失败]\n    Error --> Retry[建议重试]\n\`\`\``,
        debate_details: '分析失败',
        mermaid_code: 'graph TD\n    Start[开始分析] --> Error[分析失败]\n    Error --> Retry[建议重试]',
        structured_data: {
          sentiment_score: 50,
          heat_index: 0,
          impact_score: 0,
          sop_based: false,
          sop_name: 'general_consultant'
        }
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        report_title: '服务器错误',
        verdict_text: '服务器内部错误',
        full_markdown_report: `# 服务器错误\n\n## 📋 核心结论\n> 决策建议：服务器错误\n> \n> 服务器处理过程中出现内部错误。\n\n## ⚖️ 多空博弈\n无\n\n## 📊 数据支持\n无\n\n## 💡 行动建议\n1. [P1] 重要：请稍后再试\n2. [P2] 次要：检查网络连接\n3. [P3] 常规：联系技术支持\n\n## 🔄 逻辑流程图\n\n\`\`\`mermaid\ngraph TD\n    Start[开始请求] --> ServerError[服务器错误]\n    ServerError --> Wait[建议稍后再试]\n\`\`\``,
        debate_details: '无',
        mermaid_code: 'graph TD\n    Start[开始请求] --> ServerError[服务器错误]\n    ServerError --> Wait[建议稍后再试]',
        structured_data: {
          sentiment_score: 50,
          heat_index: 0,
          impact_score: 0,
          sop_based: false,
          sop_name: 'general_consultant'
        }
      },
      { status: 200 } // Return 200 instead of 500 to avoid frontend errors
    );
  }
}
