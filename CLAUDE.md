# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start development server on http://localhost:3000
npm run build      # Create production build
npm run start      # Start production server
npm run lint       # Run ESLint for code quality
npm run typecheck  # Run TypeScript type checking
```

### Testing
Currently no test commands are configured. Consider adding tests with:
```bash
npm test           # Run tests (needs configuration)
npm test -- --watch # Run tests in watch mode
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15.2.0 with App Router
- **React**: 19.1.0 with concurrent features
- **TypeScript**: 5.5.4 with strict mode
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS-in-JS (inline styles)
- **Analytics**: Vercel Analytics

### Project Structure
```
whipbook-next/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with analytics
│   ├── page.tsx           # Home page (book gallery)
│   └── book/
│       └── [id]/
│           └── page.tsx   # Dynamic book player page
├── src/
│   ├── components/        # React components
│   │   ├── AudiobookPlayer.tsx
│   │   ├── DesktopAudiobookPlayer.tsx
│   │   ├── MobileAudiobookPlayer.tsx
│   │   ├── DesktopBookGallery.tsx
│   │   └── DesktopBookSelector.tsx
│   ├── services/
│   │   └── bookService.ts # Supabase API service layer
│   ├── lib/
│   │   └── supabase.ts    # Supabase client configuration
│   ├── hooks/
│   │   └── useBook.ts     # Custom hook for book data
│   └── types/             # TypeScript type definitions
└── public/                # Static assets
```

### Core Architecture Patterns

1. **Service Layer Pattern**: All database interactions go through `bookService.ts`
2. **Custom Hooks**: Data fetching logic encapsulated in hooks like `useBook`
3. **Component Organization**: Separate desktop and mobile components for optimized experiences
4. **Type Safety**: Comprehensive TypeScript types for all data structures

### Key Features

1. **Word-Level Audio Synchronization**
   - Real-time highlighting of words during playback
   - Click any word to jump to that audio position
   - Smooth transitions between pages

2. **Responsive Design**
   - Desktop: Sidebar layout with keyboard shortcuts
   - Mobile: Full-screen experience with touch controls

3. **Database Schema**
   ```typescript
   // Books table
   interface Book {
     id: string;
     book_title: string;
     author: string;
     audio_url: string;
     cover_image_url: string;
     background_image_url: string;
     total_duration_ms: number;
   }

   // Pages table with word timing data
   interface Page {
     id: string;
     book_id: string;
     page_order: number;
     text: string;
     word_data: {
       words: string[];
       start_times: number[];
       end_times: number[];
     };
   }
   ```

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### MCP Integration
The project includes MCP (Model Context Protocol) configuration for Supabase integration:
- Configuration: `.mcp.json`
- Provides database access through MCP server
- Read-only access to Supabase project

### Development Guidelines

1. **Component Patterns**
   - Use functional components with TypeScript
   - Implement responsive designs with separate desktop/mobile components
   - Keep audio logic centralized in player components

2. **Data Flow**
   - All database queries through `bookService.ts`
   - Use custom hooks for data fetching
   - Handle loading and error states consistently

3. **Audio Player Implementation**
   - HTML5 Audio API for playback control
   - RAF (requestAnimationFrame) for smooth word highlighting
   - Precise timestamp synchronization with word_data

4. **Routing**
   - App Router with dynamic routes for books
   - Client-side navigation with Next.js router
   - Loading states for async page components

### Common Tasks

1. **Adding a new book feature**
   - Update types in `src/types/`
   - Extend `bookService.ts` with new methods
   - Create/modify components as needed
   - Update database schema if required

2. **Modifying the audio player**
   - Core logic in `AudiobookPlayer.tsx`
   - Desktop-specific in `DesktopAudiobookPlayer.tsx`
   - Mobile-specific in `MobileAudiobookPlayer.tsx`

3. **Database migrations**
   - Use Supabase dashboard or SQL editor
   - Update TypeScript types to match schema
   - Test with local Supabase instance if needed