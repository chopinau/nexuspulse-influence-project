import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canUseAI, incrementAIUsage } from '@/lib/membership';
import { GoogleGenAI } from "@google/genai";

export const dynamic = 'force-dynamic'; // Prevent build-time execution

export async function POST(request: NextRequest) {
  try {
    // 1. AUTHENTICATE via Session (More secure than headers)
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. VALIDATE PERMISSIONS & LIMITS
    // This handles trial expiration syncing and daily limit checks
    const { allowed, remaining, error } = await canUseAI(userId);

    if (!allowed) {
      return NextResponse.json(
        { error: error || 'Access denied.' }, 
        { status: 403 }
      );
    }

    // 3. CALL AI PROVIDER
    const body = await request.json();
    const { context } = body; 
    
    let aiResponseText = "AI Service Unavailable";

    if (process.env.API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Summarize this for a financial investor in 50 words: ${context}`,
        });
        
        if (response.text) {
          aiResponseText = response.text;
        }
      } catch (err) {
        console.error("Gemini API Error:", err);
        return NextResponse.json({ error: 'AI Service Error' }, { status: 502 });
      }
    } else {
      aiResponseText = `(Mock AI) Insight for ${session.user.email}: Positive trend detected.`;
    }

    // 4. ATOMIC INCREMENT
    // Only happens if generation succeeded
    await incrementAIUsage(userId);

    return NextResponse.json({
      summary: aiResponseText,
      meta: {
        usageRemaining: remaining - 1
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
