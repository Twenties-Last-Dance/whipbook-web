'use client'

import { useState, useRef, useEffect, useMemo } from 'react';
import type { Book, Page, WordData } from '@/services/bookService';
import { useRouter } from 'next/navigation';

interface WordTiming {
  word: string;
  startTime: number;
  endTime: number;
  index: number;
}

interface DesktopAudiobookPlayerProps {
  book: Book;
  pages: Page[];
  onBack?: () => void;
}

export default function DesktopAudiobookPlayer({ book, pages, onBack }: DesktopAudiobookPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const [showInfo, setShowInfo] = useState(false);
  const router = useRouter();

  const currentPage = pages[currentPageIndex];

  const getWordTimings = (page: Page): WordTiming[] => {
    const wordData = page.word_data as unknown as WordData;
    const { words, start_times, end_times } = wordData;
    return words.map((word, index) => ({
      word,
      startTime: start_times[index],
      endTime: end_times[index],
      index
    }));
  };

  const wordTimings = useMemo(() => 
    currentPage ? getWordTimings(currentPage) : [],
    [currentPage]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const time = audio.currentTime;
      setCurrentTime(time);

      // Find the correct page for the current time
      let correctPageIndex = currentPageIndex;
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const pageWordData = page.word_data as unknown as WordData;
        const pageStartTime = pageWordData.start_times[0];
        const pageEndTime = pageWordData.end_times[pageWordData.end_times.length - 1];
        
        if (time >= pageStartTime && time <= pageEndTime) {
          correctPageIndex = i;
          break;
        }
      }

      // Update page if needed
      if (correctPageIndex !== currentPageIndex) {
        setCurrentPageIndex(correctPageIndex);
        return; // Let the next render cycle handle word highlighting
      }

      // Find highlighted word within current page
      const currentWordIndex = wordTimings.findIndex(
        (timing) => time >= timing.startTime && time <= timing.endTime
      );
      setHighlightedWordIndex(currentWordIndex);
    };

    audio.addEventListener('timeupdate', updateTime);
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, [currentPageIndex, wordTimings, currentPage, pages]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Add keyboard event listener for spacebar
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault(); // Prevent page scroll
        togglePlayPause();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [togglePlayPause]);

  const seekToPage = (pageIndex: number) => {
    const audio = audioRef.current;
    if (!audio || !pages[pageIndex]) return;

    const page = pages[pageIndex];
    const wordData = page.word_data as unknown as WordData;
    const startTime = wordData.start_times[0];
    audio.currentTime = startTime;
    setCurrentPageIndex(pageIndex);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e9ecef',
        padding: '1rem 0',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={handleBack}
              style={{
                background: '#FF5757',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                color: 'white',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              ← Back
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img 
                src={book.cover_image_url}
                alt={book.book_title}
                style={{
                  width: '50px',
                  height: '60px',
                  borderRadius: '6px',
                  objectFit: 'cover'
                }}
              />
              <div>
                <h1 style={{
                  margin: 0,
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  {book.book_title}
                </h1>
                <p style={{
                  margin: 0,
                  fontSize: '1rem',
                  color: '#666'
                }}>
                  by {book.author}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowInfo(true)}
            style={{
              background: 'transparent',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: '#666',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            ℹ️ Book Info
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '2rem',
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Content Area with Background */}
        <main style={{
          flex: 2,
          position: 'relative',
          overflow: 'hidden',
          height: '70vh', // Reduced height
          width: '100%',
          minHeight: '500px',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          {/* Background Image */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${book.background_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            zIndex: 1,
            filter: 'brightness(0.6) contrast(1.1)',
            borderRadius: '20px'
          }} />
          
          {/* Gradient Overlay for Text Readability */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.3) 100%)',
            zIndex: 2,
            borderRadius: '20px'
          }} />

          {/* Text Content */}
          <div style={{
            position: 'relative',
            zIndex: 3,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <div style={{
              textAlign: 'center',
              fontSize: '1.8rem',
              lineHeight: 1.8,
              fontWeight: '600',
              color: 'white',
              maxWidth: '100%',
              width: '100%',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.7)',
              letterSpacing: '0.3px',
              wordWrap: 'break-word',
              whiteSpace: 'normal',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px'
            }}>
              {wordTimings.map((timing, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: highlightedWordIndex === index ? 'rgba(255, 87, 87, 0.9)' : 'transparent',
                    color: highlightedWordIndex === index ? 'white' : 'white',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    fontWeight: highlightedWordIndex === index ? '700' : '500',
                    boxShadow: highlightedWordIndex === index ? 
                      '0 4px 20px rgba(255, 87, 87, 0.6), 0 0 30px rgba(255, 87, 87, 0.3)' : 
                      'none',
                    textShadow: highlightedWordIndex === index ? 
                      '0 2px 4px rgba(0, 0, 0, 0.8)' : 
                      '2px 2px 8px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 0, 0, 0.5)',
                    transform: highlightedWordIndex === index ? 'scale(1.05)' : 'scale(1)',
                    display: 'inline-block',
                    flexShrink: 0
                  }}
                  onClick={() => {
                    const audio = audioRef.current;
                    if (audio) {
                      // Find which page this timing belongs to
                      const targetPageIndex = pages.findIndex(page => {
                        const pageWordData = page.word_data as unknown as WordData;
                        return timing.startTime >= pageWordData.start_times[0] && 
                               timing.startTime <= pageWordData.end_times[pageWordData.end_times.length - 1];
                      });
                      
                      // If we need to change pages, do it first
                      if (targetPageIndex !== -1 && targetPageIndex !== currentPageIndex) {
                        setCurrentPageIndex(targetPageIndex);
                      }
                      
                      // Always set highlighted word immediately
                      setHighlightedWordIndex(timing.index);
                      audio.currentTime = timing.startTime;
                    }
                  }}
                  onMouseOver={(e) => {
                    if (highlightedWordIndex !== index) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (highlightedWordIndex !== index) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {timing.word}
                </span>
              ))}
            </div>
          </div>
        </main>

        {/* Audio Controls Sidebar - Outside of background */}
        <aside style={{
          flex: 1,
          maxWidth: '400px',
          minWidth: '350px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          {/* Audio Controls */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e9ecef'
          }}>
              {/* Progress Bar */}
              <div style={{ marginBottom: '2rem' }}>
                <input
                  type="range"
                  min="0"
                  max={book.total_duration_ms / 1000}
                  value={currentTime}
                  onChange={(e) => {
                    const audio = audioRef.current;
                    if (audio) {
                      audio.currentTime = parseFloat(e.target.value);
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    outline: 'none',
                    cursor: 'pointer',
                    background: `linear-gradient(to right, #FF5757 0%, #FF5757 ${(currentTime / (book.total_duration_ms / 1000)) * 100}%, #e9ecef ${(currentTime / (book.total_duration_ms / 1000)) * 100}%, #e9ecef 100%)`,
                    WebkitAppearance: 'none',
                    appearance: 'none'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1rem',
                  color: '#555',
                  marginTop: '0.75rem',
                  fontWeight: '600'
                }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(book.total_duration_ms / 1000)}</span>
                </div>
              </div>

              {/* Play Controls */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2rem',
                marginTop: '1rem'
              }}>
                <button
                  onClick={() => {
                    if (currentPageIndex > 0) {
                      seekToPage(currentPageIndex - 1);
                    }
                  }}
                  disabled={currentPageIndex === 0}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '3px solid rgba(255, 87, 87, 0.3)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    color: currentPageIndex === 0 ? '#ccc' : '#FF5757',
                    fontSize: '1.5rem',
                    cursor: currentPageIndex === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                    fontWeight: 'bold'
                  }}
                  onMouseOver={(e) => {
                    if (currentPageIndex > 0) {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 87, 87, 0.3)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentPageIndex > 0) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                >
                  ⏮️
                </button>

                <button
                  onClick={togglePlayPause}
                  style={{
                    background: 'linear-gradient(135deg, #FF5757, #e04848)',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    width: '85px',
                    height: '85px',
                    color: 'white',
                    fontSize: '2.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 30px rgba(255, 87, 87, 0.5)',
                    transition: 'all 0.3s ease',
                    fontWeight: 'bold'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 87, 87, 0.6)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 87, 87, 0.5)';
                  }}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>

                <button
                  onClick={() => {
                    if (currentPageIndex < pages.length - 1) {
                      seekToPage(currentPageIndex + 1);
                    }
                  }}
                  disabled={currentPageIndex === pages.length - 1}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '3px solid rgba(255, 87, 87, 0.3)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    color: currentPageIndex === pages.length - 1 ? '#ccc' : '#FF5757',
                    fontSize: '1.5rem',
                    cursor: currentPageIndex === pages.length - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                    fontWeight: 'bold'
                  }}
                  onMouseOver={(e) => {
                    if (currentPageIndex < pages.length - 1) {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 87, 87, 0.3)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentPageIndex < pages.length - 1) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                >
                  ⏭️
                </button>
              </div>
          </div>

          {/* Current Page Info */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '1rem'
            }}>
              Page {currentPageIndex + 1} of {pages.length}
            </div>
            <div style={{
              width: '100%',
              height: '10px',
              backgroundColor: 'rgba(255, 87, 87, 0.1)',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${((currentPageIndex + 1) / pages.length) * 100}%`,
                height: '100%',
                backgroundColor: '#FF5757',
                borderRadius: '5px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Buy Now Button */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <a
              href={book.purchase_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                width: '100%',
                background: 'linear-gradient(135deg, #FF9500, #FF7700)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 25px rgba(255, 149, 0, 0.4)',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(255, 149, 0, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 149, 0, 0.4)';
              }}
            >
              🛒 BUY NOW
            </a>
            <div style={{
              fontSize: '0.8rem',
              color: '#999',
              marginTop: '0.5rem'
            }}>
              Get the physical book
            </div>
          </div>
        </aside>
      </div>

      {/* Book Info Modal */}
      {showInfo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>
                Book Details
              </h2>
              <button
                onClick={() => setShowInfo(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              <img 
                src={book.cover_image_url}
                alt={book.book_title}
                style={{
                  width: '150px',
                  height: 'auto',
                  borderRadius: '12px',
                  flexShrink: 0
                }}
              />
              <div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '0.5rem',
                  color: '#333'
                }}>
                  {book.book_title}
                </h3>
                <p style={{ 
                  color: '#666',
                  marginBottom: '1rem',
                  fontSize: '1.1rem'
                }}>
                  {book.author}
                </p>
                
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.2rem', color: '#FFD700' }}>⭐</div>
                    <div style={{ fontWeight: 'bold' }}>{book.rating_avg}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      ({book.rating_count})
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.2rem' }}>⏱️</div>
                    <div style={{ fontWeight: 'bold' }}>
                      {formatTime(book.total_duration_ms / 1000)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      Duration
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.2rem' }}>📄</div>
                    <div style={{ fontWeight: 'bold' }}>{pages.length}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      Pages
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: '1rem', color: '#333' }}>Description</h4>
              <p style={{ 
                lineHeight: 1.6, 
                color: '#666',
                fontSize: '1rem',
                marginBottom: '2rem'
              }}>
                {book.description}
              </p>
            </div>

            {/* Buy Now Button in Modal */}
            <div style={{
              textAlign: 'center',
              borderTop: '1px solid #e9ecef',
              paddingTop: '2rem'
            }}>
              <a
                href={book.purchase_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #FF9500, #FF7700)',
                  color: 'white',
                  padding: '1rem 3rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 25px rgba(255, 149, 0, 0.4)',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(255, 149, 0, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 149, 0, 0.4)';
                }}
              >
                🛒 BUY NOW ON AMAZON
              </a>
              <div style={{
                fontSize: '0.8rem',
                color: '#999',
                marginTop: '0.5rem'
              }}>
                Support us by purchasing the physical book
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={book.audio_url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}