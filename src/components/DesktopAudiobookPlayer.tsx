'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  const [isSequentialHighlighting, setIsSequentialHighlighting] = useState(false);
  const sequentialTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Sequential highlighting function to ensure no words are skipped
  const highlightWordsSequentially = useCallback((startIndex: number, endIndex: number, targetTime: number) => {
    // Handle both forward and backward movement
    const isForward = startIndex <= endIndex;
    const actualStart = Math.min(startIndex, endIndex);
    const actualEnd = Math.max(startIndex, endIndex);
    
    setIsSequentialHighlighting(true);
    
    const highlightNext = (currentIndex: number) => {
      if ((!isForward && currentIndex < actualStart) || 
          (isForward && currentIndex > actualEnd) || 
          currentIndex < 0 || currentIndex >= wordTimings.length) {
        setIsSequentialHighlighting(false);
        return;
      }
      
      setHighlightedWordIndex(currentIndex);
      
      const isComplete = (isForward && currentIndex >= endIndex) || 
                        (!isForward && currentIndex <= endIndex);
      
      if (!isComplete) {
        // Calculate delay based on word timing or use minimum delay
        const currentTiming = wordTimings[currentIndex];
        const nextIndex = isForward ? currentIndex + 1 : currentIndex - 1;
        const nextTiming = wordTimings[nextIndex];
        let delay = 80; // minimum delay in ms
        
        if (currentTiming && nextTiming) {
          const timingDiff = Math.abs((nextTiming.startTime - currentTiming.startTime) * 1000);
          delay = Math.max(40, Math.min(120, timingDiff)); // between 40ms and 120ms for faster sequential highlighting
        }
        
        sequentialTimeoutRef.current = setTimeout(() => {
          highlightNext(isForward ? currentIndex + 1 : currentIndex - 1);
        }, delay);
      } else {
        setIsSequentialHighlighting(false);
        // Set audio time to target after sequential highlighting is complete
        const audio = audioRef.current;
        if (audio && targetTime !== -1) {
          audio.currentTime = targetTime;
        }
      }
    };
    
    highlightNext(startIndex);
  }, [wordTimings]);

  // Cleanup sequential highlighting timeout
  useEffect(() => {
    return () => {
      if (sequentialTimeoutRef.current) {
        clearTimeout(sequentialTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const time = audio.currentTime;
      setCurrentTime(time);

      // Don't update highlighting if sequential highlighting is in progress
      if (isSequentialHighlighting) {
        return;
      }

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
        setHighlightedWordIndex(-1); // Reset highlighting when changing pages
        return; // Let the next render cycle handle word highlighting
      }

      // Enhanced word highlighting logic - simplified approach
      let foundWordIndex = -1;
      
      // First, try to find exact timing match
      for (let i = 0; i < wordTimings.length; i++) {
        const timing = wordTimings[i];
        if (time >= timing.startTime && time <= timing.endTime) {
          foundWordIndex = i;
          break;
        }
      }
      
      // If no exact match, find the closest word based on current time
      if (foundWordIndex === -1) {
        let closestDistance = Infinity;
        for (let i = 0; i < wordTimings.length; i++) {
          const timing = wordTimings[i];
          const distance = Math.abs(time - timing.startTime);
          if (distance < closestDistance) {
            closestDistance = distance;
            foundWordIndex = i;
          }
        }
      }
      
      // Simple highlighting - just update the highlighted word directly
      if (foundWordIndex !== -1) {
        setHighlightedWordIndex(foundWordIndex);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, [currentPageIndex, wordTimings, currentPage, pages, highlightedWordIndex, isSequentialHighlighting, isPlaying]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

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
      background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #fef7f0 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,252,255,0.95) 100%)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.08)',
        padding: '2rem 0',
        boxShadow: '0 12px 40px rgba(99, 102, 241, 0.06)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 clamp(1rem, 4vw, 2rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={handleBack}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '1rem 2rem',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(99, 102, 241, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.3)';
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
                  borderRadius: '12px',
                  objectFit: 'cover',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                }}
              />
              <div>
                <h1 style={{
                  margin: 0,
                  fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                  fontWeight: '800',
                  color: '#1e293b',
                  letterSpacing: '-0.6px'
                }}>
                  {book.book_title}
                </h1>
                <p style={{
                  margin: 0,
                  fontSize: '1rem',
                  color: '#64748b',
                  fontWeight: '600'
                }}>
                  by {book.author}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowInfo(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '2px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '16px',
              padding: '1rem 2rem',
              color: '#1e293b',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(16px)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.98)';
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(99, 102, 241, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
Book Info
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        gap: 'clamp(1rem, 3vw, 2rem)',
        padding: 'clamp(1rem, 4vw, 2rem)',
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
                    position: 'relative',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    color: 'white',
                    textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 0, 0, 0.5)',
                    display: 'inline-block',
                    flexShrink: 0
                  }}
                  onClick={() => {
                    const audio = audioRef.current;
                    if (audio && !isSequentialHighlighting) {
                      // Stop any ongoing sequential highlighting
                      if (sequentialTimeoutRef.current) {
                        clearTimeout(sequentialTimeoutRef.current);
                        setIsSequentialHighlighting(false);
                      }
                      
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
                      
                      // Simple click handling - just jump to the word and update audio time
                      setHighlightedWordIndex(timing.index);
                      audio.currentTime = timing.startTime;
                    }
                  }}
                  onMouseOver={(e) => {
                    if (highlightedWordIndex !== index) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (highlightedWordIndex !== index) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {highlightedWordIndex === index && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(99, 102, 241, 0.9)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.6), 0 0 30px rgba(99, 102, 241, 0.3)',
                        transition: 'all 0.4s ease',
                        zIndex: -1
                      }}
                    />
                  )}
                  <span style={{
                    position: 'relative',
                    zIndex: 2,
                    fontWeight: highlightedWordIndex === index ? '700' : '500'
                  }}>
                    {timing.word}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </main>

        {/* Audio Controls Sidebar - Redesigned Layout */}
        <aside style={{
          flex: '0 0 auto',
          width: 'clamp(300px, 30vw, 380px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Audio Controls */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,252,255,0.95) 100%)',
            borderRadius: '28px',
            padding: '2.5rem',
            boxShadow: '0 32px 80px rgba(99, 102, 241, 0.15)',
            border: '2px solid rgba(99, 102, 241, 0.08)',
            backdropFilter: 'blur(24px)'
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
                    borderRadius: '8px',
                    outline: 'none',
                    cursor: 'pointer',
                    background: `linear-gradient(to right, #6366f1 0%, #7c3aed ${(currentTime / (book.total_duration_ms / 1000)) * 100}%, rgba(99, 102, 241, 0.15) ${(currentTime / (book.total_duration_ms / 1000)) * 100}%, rgba(99, 102, 241, 0.15) 100%)`,
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08)'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  marginTop: '0.75rem',
                  fontWeight: '600'
                }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(book.total_duration_ms / 1000)}</span>
                </div>
              </div>

              {/* Play Controls - Centered and Balanced */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1.5rem'
              }}>
                <button
                  onClick={() => {
                    if (currentPageIndex > 0) {
                      seekToPage(currentPageIndex - 1);
                    }
                  }}
                  disabled={currentPageIndex === 0}
                  style={{
                    background: currentPageIndex === 0 ? 'rgba(243, 244, 246, 0.8)' : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,252,255,0.95) 100%)',
                    border: `2px solid ${currentPageIndex === 0 ? 'rgba(229, 231, 235, 0.5)' : 'rgba(99, 102, 241, 0.2)'}`,
                    borderRadius: '20px',
                    width: '64px',
                    height: '64px',
                    color: currentPageIndex === 0 ? '#9ca3af' : '#6366f1',
                    fontSize: '1.3rem',
                    cursor: currentPageIndex === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: currentPageIndex === 0 ? '0 4px 12px rgba(0, 0, 0, 0.08)' : '0 12px 32px rgba(99, 102, 241, 0.2)',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(16px)'
                  }}
                  onMouseOver={(e) => {
                    if (currentPageIndex > 0) {
                      e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 20px 48px rgba(99, 102, 241, 0.3)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentPageIndex > 0) {
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(99, 102, 241, 0.2)';
                    }
                  }}
                >
                  ◀◀
                </button>

                <button
                  onClick={togglePlayPause}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '24px',
                    width: '80px',
                    height: '80px',
                    color: 'white',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 16px 48px rgba(99, 102, 241, 0.4)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontWeight: 'bold'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1) translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 24px 64px rgba(99, 102, 241, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(99, 102, 241, 0.4)';
                  }}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>

                <button
                  onClick={() => {
                    if (currentPageIndex < pages.length - 1) {
                      seekToPage(currentPageIndex + 1);
                    }
                  }}
                  disabled={currentPageIndex === pages.length - 1}
                  style={{
                    background: currentPageIndex === pages.length - 1 ? 'rgba(243, 244, 246, 0.8)' : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,252,255,0.95) 100%)',
                    border: `2px solid ${currentPageIndex === pages.length - 1 ? 'rgba(229, 231, 235, 0.5)' : 'rgba(99, 102, 241, 0.2)'}`,
                    borderRadius: '20px',
                    width: '64px',
                    height: '64px',
                    color: currentPageIndex === pages.length - 1 ? '#9ca3af' : '#6366f1',
                    fontSize: '1.3rem',
                    cursor: currentPageIndex === pages.length - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: currentPageIndex === pages.length - 1 ? '0 4px 12px rgba(0, 0, 0, 0.08)' : '0 12px 32px rgba(99, 102, 241, 0.2)',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(16px)'
                  }}
                  onMouseOver={(e) => {
                    if (currentPageIndex < pages.length - 1) {
                      e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 20px 48px rgba(99, 102, 241, 0.3)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentPageIndex < pages.length - 1) {
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(99, 102, 241, 0.2)';
                    }
                  }}
                >
                  ▶▶
                </button>
              </div>
          </div>

          {/* Current Page Info */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,252,255,0.95) 100%)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 20px 48px rgba(99, 102, 241, 0.12)',
            border: '2px solid rgba(99, 102, 241, 0.08)',
            textAlign: 'center',
            backdropFilter: 'blur(24px)'
          }}>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: '800',
              color: '#1e293b',
              marginBottom: '1.5rem',
              letterSpacing: '-0.4px'
            }}>
              Page {currentPageIndex + 1} of {pages.length}
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                width: `${((currentPageIndex + 1) / pages.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #6366f1 0%, #7c3aed 100%)',
                borderRadius: '12px',
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
              }} />
            </div>
          </div>

          {/* Buy Now Button */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,252,255,0.95) 100%)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 20px 48px rgba(99, 102, 241, 0.12)',
            border: '2px solid rgba(99, 102, 241, 0.08)',
            textAlign: 'center',
            backdropFilter: 'blur(24px)'
          }}>
            <a
              href={book.purchase_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                width: '100%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                padding: '1.2rem 1.75rem',
                borderRadius: '16px',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: '700',
                boxShadow: '0 12px 32px rgba(245, 158, 11, 0.35)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.3px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 48px rgba(245, 158, 11, 0.45)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(245, 158, 11, 0.35)';
              }}
            >
              🛒 BUY NOW
            </a>
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginTop: '0.5rem',
              fontWeight: '500'
            }}>
              Get the book
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
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
            borderRadius: '24px',
            padding: '2.5rem',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 87, 87, 0.1)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
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
                More info & purchase options
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