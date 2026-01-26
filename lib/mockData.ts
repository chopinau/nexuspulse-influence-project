import { Entity, DynamicUpdate, TrendPoint } from '../types';

export const ENTITIES: Entity[] = [
  { id: '1', slug: 'elon-musk', name: 'Elon Musk', type: 'person', heatIndex: 98, trend: 5.2, sentiment: 'neutral', tags: ['Tesla', 'SpaceX', 'X'], stockSymbol: 'TSLA' },
  { id: '2', slug: 'donald-trump', name: 'Donald Trump', type: 'person', heatIndex: 95, trend: 12.1, sentiment: 'positive', tags: ['Politics', 'Media', 'Real Estate'], stockSymbol: 'DJT' },
  { id: '3', slug: 'mark-zuckerberg', name: 'Mark Zuckerberg', type: 'person', heatIndex: 88, trend: -1.5, sentiment: 'neutral', tags: ['Meta', 'VR', 'AI'], stockSymbol: 'META' },
  { id: '4', slug: 'ev-market', name: 'Electric Vehicles', type: 'category', heatIndex: 92, trend: 3.4, sentiment: 'positive', tags: ['Battery', 'China', 'Export'] },
  { id: '5', slug: 'fast-fashion', name: 'Fast Fashion', type: 'category', heatIndex: 85, trend: -0.8, sentiment: 'negative', tags: ['Shein', 'Temu', 'Supply Chain'] },
];

export const DYNAMICS: DynamicUpdate[] = [
  { id: '101', entityId: '1', title: 'Starlink IPO Rumors Intensify', summary: 'Market analysts predict a spinoff by Q4 2025, driving huge volume in space-tech ETFs.', source: 'Bloomberg', timestamp: '2024-05-20T10:00:00Z', sentiment: 'positive', url: '#' },
  { id: '102', entityId: '4', title: 'EU Tariffs on Chinese EVs', summary: 'New regulations may impact profit margins for outbound brands like BYD and Nio.', source: 'Reuters', timestamp: '2024-05-20T09:30:00Z', sentiment: 'negative', url: '#' },
  { id: '103', entityId: '2', title: 'Trump Media Announces New Platform', summary: 'Truth Social integration with crypto payments is being tested.', source: 'TechCrunch', timestamp: '2024-05-19T14:00:00Z', sentiment: 'positive', url: '#' },
  { id: '104', entityId: '5', title: 'Supply Chain Audits Hit Fast Fashion', summary: 'Major crackdown on sustainability claims affecting stock prices.', source: 'Vogue Business', timestamp: '2024-05-19T11:15:00Z', sentiment: 'negative', url: '#' },
];

export const generateTrendData = (): { labels: string[], datasets: any[] } => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return {
    labels,
    datasets: [
      {
        label: 'Elon Musk',
        data: [85, 88, 87, 92, 95, 94, 98],
        borderColor: '#00f3ff',
        backgroundColor: 'rgba(0, 243, 255, 0.1)',
        tension: 0.4
      },
      {
        label: 'EV Market',
        data: [70, 72, 75, 80, 85, 88, 92],
        borderColor: '#bd00ff',
        backgroundColor: 'rgba(189, 0, 255, 0.1)',
        tension: 0.4
      }
    ]
  };
};