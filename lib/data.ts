export interface Issue {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  votes: {
    for: number;
    against: number;
    abstain: number;
    total: number;
  };
  status: 'pending' | 'voted' | 'closed';
}
