export interface MarketNews {
  id: number;
  title: string;
  content: string;
  created_at: string;
  // Top-level fields (if columns exist)
  sentiment?: number;
  heat_index?: number;
  impact_score?: number;
  metadata: {
    sentiment_score?: number;
    heat_index?: number;
    summary?: string;
    impact_score?: number;
  };
}
