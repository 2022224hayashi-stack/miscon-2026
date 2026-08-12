export interface Candidate {
  id: number;
  name: string;
  school_year?: string;
  img?: string;
}

export interface ResultItem {
  id: number;
  name: string;
  votes: number;
}

export interface AdminResultsResponse {
  success?: boolean;
  summary?: ResultItem[];
  totalVotes?: number;
  error?: string;
}