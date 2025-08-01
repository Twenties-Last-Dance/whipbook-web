export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      book_genre: {
        Row: {
          book_id: string
          created_at: string
          genre_id: number
          updated_at: string
        }
        Insert: {
          book_id: string
          created_at?: string
          genre_id: number
          updated_at?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          genre_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_genre_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_genre_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books_random"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_genre_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genre"
            referencedColumns: ["id"]
          },
        ]
      }
      book_prompt: {
        Row: {
          book_id: string
          created_at: string
          id: number
          prompt_name: string
          updated_at: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: number
          prompt_name: string
          updated_at?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: number
          prompt_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_prompt_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_prompt_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books_random"
            referencedColumns: ["id"]
          },
        ]
      }
      book_reviews: {
        Row: {
          book_id: string
          created_at: string
          id: string
          review: string
          updated_at: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          review: string
          updated_at?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          review?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_reviews_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_reviews_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books_random"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          audio_url: string
          author: string
          background_image_url: string
          book_summary: string
          book_title: string
          cover_image_url: string
          created_at: string
          customer_says: string | null
          description: string
          editorial_review: string | null
          id: string
          isbn_13: string
          publisher: string
          purchase_link: string
          rating_avg: number
          rating_count: number
          total_duration_ms: number
          updated_at: string
        }
        Insert: {
          audio_url: string
          author: string
          background_image_url: string
          book_summary: string
          book_title: string
          cover_image_url: string
          created_at?: string
          customer_says?: string | null
          description: string
          editorial_review?: string | null
          id?: string
          isbn_13: string
          publisher: string
          purchase_link: string
          rating_avg: number
          rating_count: number
          total_duration_ms: number
          updated_at?: string
        }
        Update: {
          audio_url?: string
          author?: string
          background_image_url?: string
          book_summary?: string
          book_title?: string
          cover_image_url?: string
          created_at?: string
          customer_says?: string | null
          description?: string
          editorial_review?: string | null
          id?: string
          isbn_13?: string
          publisher?: string
          purchase_link?: string
          rating_avg?: number
          rating_count?: number
          total_duration_ms?: number
          updated_at?: string
        }
        Relationships: []
      }
      genre: {
        Row: {
          amazon_node: number
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          amazon_node: number
          created_at?: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          amazon_node?: number
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      masterpieces: {
        Row: {
          book_id: string
          created_at: string
          id: number
          updated_at: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: number
          updated_at?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "masterpieces_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "masterpieces_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books_random"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          book_id: string
          created_at: string
          id: string
          page_order: number
          text: string
          update_at: string
          word_data: Json
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          page_order: number
          text: string
          update_at?: string
          word_data: Json
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          page_order?: number
          text?: string
          update_at?: string
          word_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "pages_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books_random"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      books_random: {
        Row: {
          audio_url: string | null
          author: string | null
          background_image_url: string | null
          book_summary: string | null
          book_title: string | null
          cover_image_url: string | null
          created_at: string | null
          customer_says: string | null
          description: string | null
          editorial_review: string | null
          id: string | null
          isbn_13: string | null
          publisher: string | null
          purchase_link: string | null
          random_order: number | null
          rating_avg: number | null
          rating_count: number | null
          total_duration_ms: number | null
          updated_at: string | null
        }
        Insert: {
          audio_url?: string | null
          author?: string | null
          background_image_url?: string | null
          book_summary?: string | null
          book_title?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          customer_says?: string | null
          description?: string | null
          editorial_review?: string | null
          id?: string | null
          isbn_13?: string | null
          publisher?: string | null
          purchase_link?: string | null
          random_order?: never
          rating_avg?: number | null
          rating_count?: number | null
          total_duration_ms?: number | null
          updated_at?: string | null
        }
        Update: {
          audio_url?: string | null
          author?: string | null
          background_image_url?: string | null
          book_summary?: string | null
          book_title?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          customer_says?: string | null
          description?: string | null
          editorial_review?: string | null
          id?: string | null
          isbn_13?: string | null
          publisher?: string | null
          purchase_link?: string | null
          random_order?: never
          rating_avg?: number | null
          rating_count?: number | null
          total_duration_ms?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const