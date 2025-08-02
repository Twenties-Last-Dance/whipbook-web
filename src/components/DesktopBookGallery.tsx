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
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        fontSize: '1.2rem',
        color: '#6b7280',
        fontWeight: '600'
      }}>
        Loading books...
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 87, 87, 0.1)',
        padding: '1.5rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
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
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1a1a1a',
            letterSpacing: '-0.5px'
          }}>
            📚 Whipbook Library
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
                padding: '14px 18px 14px 45px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '2px solid rgba(255, 87, 87, 0.15)',
                borderRadius: '20px',
                color: '#1a1a1a',
                fontSize: '1rem',
                fontWeight: '500',
                outline: 'none',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255, 87, 87, 0.4)';
                e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                e.target.style.boxShadow = '0 8px 24px rgba(255, 87, 87, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 87, 87, 0.15)';
                e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}
            />
            <div style={{
              position: 'absolute',
              left: '18px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.1rem',
              color: '#9ca3af'
            }}>
              🔍
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0.75rem 2rem 0'
        }}>
          <div style={{
            fontSize: '0.95rem',
            color: '#64748b',
            fontWeight: '600',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
            padding: '8px 16px',
            borderRadius: '12px',
            display: 'inline-block'
          }}>
            {filteredBooks.length} books found
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(1rem, 4vw, 2rem)'
      }}>
        {/* Gallery Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))',
          gap: 'clamp(1rem, 3vw, 2rem)'
        }}>
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => handleBookClick(book)}
              style={{
                cursor: 'pointer',
                borderRadius: '20px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid rgba(255, 87, 87, 0.1)',
                backdropFilter: 'blur(20px)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(255, 87, 87, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 87, 87, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 87, 87, 0.1)';
              }}
            >
              <div style={{
                position: 'relative',
                aspectRatio: '3/4',
                overflow: 'hidden',
                borderRadius: '16px 16px 0 0'
              }}>
                <img
                  src={book.cover_image_url}
                  alt={book.book_title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
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
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.85)',
                    borderRadius: '16px',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    color: 'white',
                    fontWeight: '600',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <span style={{ color: '#FFD700' }}>⭐</span>
                    <span>{book.rating_avg.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div style={{
                padding: '1.25rem'
              }}>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  lineHeight: 1.3,
                  color: '#1a1a1a',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  textOverflow: 'ellipsis',
                  minHeight: '2.6rem',
                  letterSpacing: '-0.3px'
                }}>
                  {book.book_title}
                </h3>
                
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontWeight: '500'
                }}>
                  {book.author}
                </p>

                {/* Additional info */}
                <div style={{
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  fontWeight: '500'
                }}>
                  <span>
                    🎧 {Math.floor(book.total_duration_ms / 60000)} min
                  </span>
                  {book.rating_count > 0 && (
                    <span>
                      💬 {book.rating_count} reviews
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
                background: 'linear-gradient(135deg, #FF5757 0%, #e04848 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '1rem 2rem',
                color: 'white',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '700',
                boxShadow: '0 8px 24px rgba(255, 87, 87, 0.3)',
                transition: 'all 0.3s ease',
                letterSpacing: '0.5px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 87, 87, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 87, 87, 0.3)';
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