export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          value?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          attendees: string[] | null
          created_at: string | null
          created_by: string
          description: string | null
          end_time: string
          event_type: string | null
          id: string
          location: string | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string | null
          created_by: string
          description?: string | null
          end_time: string
          event_type?: string | null
          id?: string
          location?: string | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          attendees?: string[] | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_time?: string
          event_type?: string | null
          id?: string
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          created_at: string | null
          id: string
          rate: number
          symbol: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          rate?: number
          symbol: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          rate?: number
          symbol?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          company: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          description: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          folder: string | null
          id: string
          name: string
          task_id: string | null
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder?: string | null
          id?: string
          name: string
          task_id?: string | null
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder?: string | null
          id?: string
          name?: string
          task_id?: string | null
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          email: string
          expires_at: string | null
          id: string
          invite_token: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          sent_at: string | null
          status: string
        }
        Insert: {
          accepted_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invite_token: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          sent_at?: string | null
          status?: string
        }
        Update: {
          accepted_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invite_token?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_paid: number
          balance_due: number
          created_at: string | null
          customer_address: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          discount: number
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          items: Json
          notes: string | null
          sale_id: string | null
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          terms: string | null
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number
          balance_due?: number
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          discount?: number
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          items?: Json
          notes?: string | null
          sale_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          terms?: string | null
          total?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          balance_due?: number
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          discount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          sale_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          terms?: string | null
          total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category: string | null
          color: string
          cost_price: number
          created_at: string | null
          id: string
          image: string | null
          min_stock: number | null
          name: string
          stock: number | null
          user_id: string | null
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          color: string
          cost_price: number
          created_at?: string | null
          id?: string
          image?: string | null
          min_stock?: number | null
          name: string
          stock?: number | null
          user_id?: string | null
        }
        Update: {
          barcode?: string | null
          category?: string | null
          color?: string
          cost_price?: number
          created_at?: string | null
          id?: string
          image?: string | null
          min_stock?: number | null
          name?: string
          stock?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string | null
          customer: string
          date: string
          due_date: string | null
          id: string
          method: string
          notes: string | null
          paid: number
          payment_type: string
          product_id: string
          profit: number
          quantity: number
          remaining: number
          sale_price: number
          status: string
          total: number
          user_id: string | null
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string | null
          customer: string
          date: string
          due_date?: string | null
          id?: string
          method: string
          notes?: string | null
          paid: number
          payment_type: string
          product_id: string
          profit: number
          quantity: number
          remaining: number
          sale_price: number
          status: string
          total: number
          user_id?: string | null
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string | null
          customer?: string
          date?: string
          due_date?: string | null
          id?: string
          method?: string
          notes?: string | null
          paid?: number
          payment_type?: string
          product_id?: string
          profit?: number
          quantity?: number
          remaining?: number
          sale_price?: number
          status?: string
          total?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      task_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_status: string
          old_status: string | null
          task_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status: string
          old_status?: string | null
          task_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status?: string
          old_status?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_business_tools: {
        Row: {
          created_at: string | null
          id: string
          position: number | null
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          position?: number | null
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          position?: number | null
          tool_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_initial_owner: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "member"
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
    Enums: {
      app_role: ["owner", "admin", "member"],
    },
  },
} as const
