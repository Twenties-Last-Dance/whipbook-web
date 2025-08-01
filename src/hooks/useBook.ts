import { useState, useEffect } from 'react';
import { bookService } from '@/services/bookService';
import type { Book, Page } from '@/services/bookService';

export function useBook(bookId?: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if no bookId is provided
    if (!bookId) {
      setLoading(false);
      setBook(null);
      setPages([]);
      setError(null);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const fetchedBook = await bookService.getBookById(bookId!);

        if (!fetchedBook) {
          setError('Book not found');
          return;
        }

        setBook(fetchedBook);
        
        const fetchedPages = await bookService.getBookPages(fetchedBook.id);
        setPages(fetchedPages);
        
      } catch (err) {
        setError('Failed to fetch book data');
        console.error('Error fetching book data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [bookId]);

  return { book, pages, loading, error };
}

export function useBookByIsbn(isbn?: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if no ISBN is provided
    if (!isbn) {
      setLoading(false);
      setBook(null);
      setPages([]);
      setError(null);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const fetchedBook = await bookService.getBookByIsbn(isbn!);

        if (!fetchedBook) {
          setError('Book not found');
          return;
        }

        setBook(fetchedBook);
        
        const fetchedPages = await bookService.getBookPages(fetchedBook.id);
        setPages(fetchedPages);
        
      } catch (err) {
        setError('Failed to fetch book data');
        console.error('Error fetching book data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isbn]);

  return { book, pages, loading, error };
}