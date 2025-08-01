'use client'

import { useState, useEffect } from 'react';
import { bookService } from '@/services/bookService';
import type { Book } from '@/services/bookService';
import { useRouter } from 'next/navigation';

interface DesktopBookGalleryProps {
  onBookSelect?: (book: Book) => void;
}

export default function DesktopBookGallery({ onBookSelect }: DesktopBookGalleryProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchBooks() {
      try {
        const fetchedBooks = await bookService.getAllBooks();
        setBooks(fetchedBooks);
        setFilteredBooks(fetchedBooks);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book =>
        book.book_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchTerm, books]);

  const handleBookClick = (book: Book) => {
    if (onBookSelect) {
      onBookSelect(book);
    } else {
      router.push(`/book/${book.isbn_13}`);
    }
  };

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
        Loading books...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e9ecef',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Book Library
          </h1>

          {/* Search Bar */}
          <div style={{
            position: 'relative',
            width: '400px'
          }}>
            <input
              type="text"
              placeholder="Search books or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                backgroundColor: '#f8f9fa',
                border: '2px solid #e9ecef',
                borderRadius: '25px',
                color: '#333',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#FF5757';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e9ecef';
                e.target.style.backgroundColor = '#f8f9fa';
              }}
            />
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.2rem',
              color: '#666'
            }}>
              🔍
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0.5rem 2rem 0',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          {filteredBooks.length} books found
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Gallery Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => handleBookClick(book)}
              style={{
                cursor: 'pointer',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                border: '1px solid #e9ecef'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                position: 'relative',
                aspectRatio: '3/4',
                overflow: 'hidden'
              }}>
                <img
                  src={book.cover_image_url}
                  alt={book.book_title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.style.backgroundColor = '#f8f9fa';
                    target.parentElement!.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #FF5757; font-size: 3rem;">📚</div>';
                  }}
                />
                
                {/* Rating Badge */}
                {book.rating_avg > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    borderRadius: '12px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    color: 'white'
                  }}>
                    <span style={{ color: '#FFD700' }}>⭐</span>
                    <span>{book.rating_avg.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div style={{
                padding: '1rem'
              }}>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  lineHeight: 1.3,
                  color: '#333',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  textOverflow: 'ellipsis',
                  minHeight: '2.6rem'
                }}>
                  {book.book_title}
                </h3>
                
                <p style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#666',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}>
                  {book.author}
                </p>

                {/* Additional info */}
                <div style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#999'
                }}>
                  <span>
                    {Math.floor(book.total_duration_ms / 60000)} min
                  </span>
                  {book.rating_count > 0 && (
                    <span>
                      {book.rating_count} reviews
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBooks.length === 0 && !loading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
            <h3 style={{ 
              marginBottom: '0.5rem',
              color: '#333',
              fontSize: '1.5rem'
            }}>
              No books found
            </h3>
            <p style={{ 
              color: '#666',
              marginBottom: '1.5rem',
              fontSize: '1rem'
            }}>
              Try adjusting your search terms or browse all books
            </p>
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: '#FF5757',
                border: 'none',
                borderRadius: '8px',
                padding: '1rem 2rem',
                color: 'white',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Clear Search
            </button>
          </div>
        )}
      </main>
    </div>
  );
}