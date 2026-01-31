export interface MarketNews {
  id: number;
  title: string;
  content: string;
  created_at: string;
  metadata: {
    sentiment_score?: number;
    heat_index?: number;
    summary?: string;
  };
}
