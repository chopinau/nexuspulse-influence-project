import { createClient } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Initialize Supabase client directly here to avoid context/hook issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getLatestReport() {
  const { data, error } = await supabase
    .from('market_news')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching report:', error);
    return null;
  }
  return data;
}

export default async function IntelPage() {
  const report = await getLatestReport();

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-red-500">无法获取情报</h1>
        <p className="text-slate-400">请检查数据库连接或稍后再试。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-cyan-400">{report.title}</h1>
        <div className="text-sm text-slate-400 mt-2">
          生成时间: {new Date(report.created_at).toLocaleString('zh-CN')}
        </div>
      </header>
      
      <article className="prose prose-invert prose-lg max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {report.content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
