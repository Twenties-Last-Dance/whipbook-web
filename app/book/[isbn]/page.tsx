'use client'

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBookByIsbn } from '@/hooks/useBook';
import DesktopAudiobookPlayer from '@/components/DesktopAudiobookPlayer';

export default function BookPage() {
  const params = useParams();
  const isbn = typeof params.isbn === 'string' ? params.isbn : params.isbn?.[0];
  
  const { book, pages, loading, error } = useBookByIsbn(isbn);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading book...
      </div>
    );
  }

  if (error || !book) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
        <h2 style={{ 
          fontSize: '1.5rem', 
          color: '#333', 
          marginBottom: '0.5rem' 
        }}>
          Book not found
        </h2>
        <p style={{ 
          color: '#666', 
          marginBottom: '2rem',
          fontSize: '1rem'
        }}>
          {error || 'The book you are looking for does not exist.'}
        </p>
        <Link 
          href="/"
          style={{
            background: '#FF5757',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <DesktopAudiobookPlayer 
      book={book} 
      pages={pages}
    />
  );
}