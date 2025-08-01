export interface Book {
  id: string;
  book_title: string;
  author: string;
  cover_image_url: string;
  book_summary: string;
  purchase_link: string;
  isbn_13: string;
  publisher: string;
  audio_url: string;
  total_duration_ms: number;
  background_image_url: string;
  description: string;
  editorial_review: string | null;
  customer_says: string | null;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface WordData {
  words: string[];
  start_times: number[];
  end_times: number[];
}

export interface Page {
  id: string;
  book_id: string;
  page_order: number;
  text: string;
  word_data: WordData;
  created_at: string;
  update_at: string;
}

export interface WordTiming {
  word: string;
  startTime: number;
  endTime: number;
  index: number;
}