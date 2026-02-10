import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// Force dynamic to prevent static optimization
export const dynamic = 'force-dynamic';

const PYTHON_TIMEOUT = 300000; // 5 minutes timeout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, mode = "GENERAL", strategy_mode = "incubation", category, inventory, daily_sales, listing_text, pain_point } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // VERCEL PRODUCTION MODE: Use Internal HTTP Call to Python Serverless Function
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      const host = request.headers.get('host');
      const apiUrl = `${protocol}://${host}/api/py/index`; // Mapped in vercel.json

      try {
        const pyResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (!pyResponse.ok) {
          throw new Error(`Python API Error: ${pyResponse.statusText}`);
        }

        const data = await pyResponse.json();
        return NextResponse.json(data);
      } catch (error) {
        console.error(`Production Mode Error: ${error}`);
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
    }

    // LOCAL DEVELOPMENT MODE: Spawn Process
    // Resolve path to the python script
    // Assuming the script is at python_backend/report_engine_only.py relative to project root
    const scriptPath = path.resolve(process.cwd(), 'python_backend', 'report_engine_only.py');
    
    // Check if script exists
    const fs = require('fs');
    if (!fs.existsSync(scriptPath)) {
      console.error(`Script not found: ${scriptPath}`);
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
    
    // Command: python python_backend/report_engine_only.py --query "topic" --mode "MODE" ...
    const args = [scriptPath, '--query', topic, '--mode', mode, '--strategy_mode', strategy_mode];
    
    // Append optional fields if they exist
    if (category) args.push('--category', category);
    if (inventory !== undefined) args.push('--inventory', inventory.toString());
    if (daily_sales !== undefined) args.push('--sales', daily_sales.toString());
    if (listing_text) args.push('--listing', listing_text);
    if (pain_point) args.push('--pain_point', pain_point);

    const pythonProcess = spawn('python', args);

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

    // Handle error event
    pythonProcess.on('error', (error) => {
      console.error(`Spawn error: ${error}`);
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
      const delimiterMatch = outputData.match(/---JSON_START---([\s\S]*?)---JSON_END---/);
      if (delimiterMatch && delimiterMatch[1]) {
        jsonOutput = JSON.parse(delimiterMatch[1].trim());
      } else {
        throw new Error('Delimited JSON not found in Python output');
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
