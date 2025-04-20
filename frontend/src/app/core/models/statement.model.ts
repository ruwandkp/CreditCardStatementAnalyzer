export interface Transaction {
  id: string;
  post_date: string;
  inv_date: string;
  description: string;
  amount: number;
  category: string;
}

export interface Statement {
  id: string;
  filename: string;
  month: number;
  year: number;
  upload_date: string;
  transactions: Transaction[];
}

export interface StatementList {
  statements: Statement[];
}

export interface CategorySummary {
  [category: string]: number;
}

export interface StatementSummary {
  id: string;
  month: number;
  year: number;
  summary: CategorySummary;
  total: number;
}

export interface ComparisonData {
  comparison: StatementSummary[];
} 