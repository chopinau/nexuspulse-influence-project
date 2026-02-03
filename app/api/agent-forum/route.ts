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
          error: 'Failed to generate report',
          details: errorData,
          content: `# 报告生成失败\n\n## 原因\n${errorData}\n\n## 建议\n请尝试更换关键词或稍后再试。`,
          metadata: {
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

    // Extract JSON from Python output using regex
    // Look for the last valid JSON object in the output
    let jsonOutput = null;
    try {
      // Find all JSON objects in the output
      const jsonMatches = outputData.match(/\{[\s\S]*?\}/g);
      if (jsonMatches) {
        // Get the last JSON object (most likely the report)
        const lastJson = jsonMatches[jsonMatches.length - 1];
        jsonOutput = JSON.parse(lastJson);
      }
    } catch (e) {
      console.error('Failed to extract JSON from Python output:', e);
    }

    // Return the extracted JSON or a placeholder
    if (jsonOutput) {
      return NextResponse.json(jsonOutput);
    } else {
      return NextResponse.json({
        content: `# 关于 ${topic} 的深度战略研判\n\n## 📋 核心结论\n正在生成报告...\n\n## ⚖️ 多空博弈\n正在分析...\n\n## 📊 数据支持\n正在收集...\n\n## 💡 行动建议\n正在制定...\n\n## 🔄 逻辑流程图\n\n\`\`\`mermaid\ngraph TD\n    A[开始分析] --> B[数据收集]\n    B --> C[多头分析]\n    B --> D[空头分析]\n    C --> E[决策评估]\n    D --> E\n    E --> F[最终结论]\n\`\`\``,
        metadata: {
          sentiment_score: 50,
          heat_index: 50,
          impact_score: 50,
          sop_based: true,
          sop_name: 'general_consultant'
        }
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        content: `# 服务器错误\n\n## 原因\n${error instanceof Error ? error.message : '未知错误'}\n\n## 建议\n请稍后再试。`,
        metadata: {
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
