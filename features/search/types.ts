export interface SearchDocument {
  id: string;
  type: "page" | "blog";
  title: string;
  path: string;
  excerpt: string;
  publishedDate?: string | null;
  updatedAt: string;
}

export interface SearchIndex {
  version: number;
  generatedAt: string;
  documents: SearchDocument[];
}

export interface SearchResult extends SearchDocument {
  score?: number;
}
