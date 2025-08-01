import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/supabase';

export type Book = Tables<'books'>;
export type Page = Tables<'pages'>;

export interface WordData {
  words: string[];
  start_times: number[];
  end_times: number[];
}

export const bookService = {
  async getRandomBook(): Promise<Book | null> {
    const { data, error } = await supabase
      .from('books_random')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching random book:', error);
      return null;
    }

    return data as Book;
  },

  async getBookById(bookId: string): Promise<Book | null> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();

    if (error) {
      console.error('Error fetching book:', error);
      return null;
    }

    return data;
  },

  async getBookByIsbn(isbn: string): Promise<Book | null> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('isbn_13', isbn)
      .single();

    if (error) {
      console.error('Error fetching book by ISBN:', error);
      return null;
    }

    return data;
  },

  async getBookPages(bookId: string): Promise<Page[]> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('book_id', bookId)
      .order('page_order', { ascending: true });

    if (error) {
      console.error('Error fetching pages:', error);
      return [];
    }

    return data;
  },

  async getAllBooks(): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all books:', error);
      return [];
    }

    return data;
  }
};