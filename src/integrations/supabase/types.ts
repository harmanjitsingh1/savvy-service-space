export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string
          created_at: string | null
          duration: number
          id: string
          notes: string | null
          provider_id: string
          provider_status: string | null
          service_id: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          created_at?: string | null
          duration: number
          id?: string
          notes?: string | null
          provider_id: string
          provider_status?: string | null
          service_id?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          created_at?: string | null
          duration?: number
          id?: string
          notes?: string | null
          provider_id?: string
          provider_status?: string | null
          service_id?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "provider_services"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message: string | null
          last_message_time: string | null
          unread_by_user1: number | null
          unread_by_user2: number | null
          updated_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          unread_by_user1?: number | null
          unread_by_user2?: number | null
          updated_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          unread_by_user1?: number | null
          unread_by_user2?: number | null
          updated_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          id: string
          image: string | null
          name: string | null
          phone: string | null
          role: string | null
          state: string | null
          updated_at: string | null
          zipcode: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          id: string
          image?: string | null
          name?: string | null
          phone?: string | null
          role?: string | null
          state?: string | null
          updated_at?: string | null
          zipcode?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          name?: string | null
          phone?: string | null
          role?: string | null
          state?: string | null
          updated_at?: string | null
          zipcode?: string | null
        }
        Relationships: []
      }
      provider_earnings: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          id: string
          provider_id: string
          status: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          id?: string
          provider_id: string
          status?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          id?: string
          provider_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_services: {
        Row: {
          availability: Json | null
          category: string
          created_at: string | null
          description: string | null
          duration: number
          id: string
          images: string[] | null
          price: number
          provider_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          availability?: Json | null
          category: string
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          images?: string[] | null
          price: number
          provider_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          availability?: Json | null
          category?: string
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          images?: string[] | null
          price?: number
          provider_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_services_provider_id_fkey1"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_services: {
        Row: {
          created_at: string | null
          id: string
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          service_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "provider_services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          duration: number
          id: string
          image: string | null
          price: number
          provider_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          image?: string | null
          price: number
          provider_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          image?: string | null
          price?: number
          provider_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_conversations: {
        Args: { current_user_id: string }
        Returns: {
          id: string
          user1_id: string
          user2_id: string
          last_message: string
          last_message_time: string
          unread_by_user1: number
          unread_by_user2: number
          other_user_id: string
          other_user_full_name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
