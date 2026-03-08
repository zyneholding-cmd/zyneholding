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
      business_applications: {
        Row: {
          applicant_user_id: string | null
          business_id: string
          cover_letter: string | null
          created_at: string | null
          email: string
          experience_level: string | null
          full_name: string
          id: string
          phone: string | null
          position: string | null
          position_id: string | null
          resume_url: string | null
          skills: string[] | null
          status: string
          updated_at: string | null
        }
        Insert: {
          applicant_user_id?: string | null
          business_id: string
          cover_letter?: string | null
          created_at?: string | null
          email: string
          experience_level?: string | null
          full_name: string
          id?: string
          phone?: string | null
          position?: string | null
          position_id?: string | null
          resume_url?: string | null
          skills?: string[] | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          applicant_user_id?: string | null
          business_id?: string
          cover_letter?: string | null
          created_at?: string | null
          email?: string
          experience_level?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          position?: string | null
          position_id?: string | null
          resume_url?: string | null
          skills?: string[] | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_applications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "business_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      business_listings: {
        Row: {
          application_count: number | null
          benefits: string[] | null
          category: string | null
          cover_image_url: string | null
          created_at: string | null
          culture: string | null
          description: string | null
          featured_until: string | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          location: string | null
          logo_url: string | null
          owner_id: string
          positions: Json | null
          rating: number | null
          requirements: string | null
          salary_range: string | null
          status: string
          team_size: string | null
          title: string
          updated_at: string | null
          views_count: number | null
          website: string | null
        }
        Insert: {
          application_count?: number | null
          benefits?: string[] | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          culture?: string | null
          description?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          owner_id: string
          positions?: Json | null
          rating?: number | null
          requirements?: string | null
          salary_range?: string | null
          status?: string
          team_size?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
          website?: string | null
        }
        Update: {
          application_count?: number | null
          benefits?: string[] | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          culture?: string | null
          description?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          owner_id?: string
          positions?: Json | null
          rating?: number | null
          requirements?: string | null
          salary_range?: string | null
          status?: string
          team_size?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_positions: {
        Row: {
          applications_count: number | null
          business_id: string
          created_at: string | null
          description: string | null
          employment_type: string | null
          experience_level: string | null
          id: string
          is_open: boolean | null
          requirements: string | null
          salary_range: string | null
          skills_required: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          applications_count?: number | null
          business_id: string
          created_at?: string | null
          description?: string | null
          employment_type?: string | null
          experience_level?: string | null
          id?: string
          is_open?: boolean | null
          requirements?: string | null
          salary_range?: string | null
          skills_required?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          applications_count?: number | null
          business_id?: string
          created_at?: string | null
          description?: string | null
          employment_type?: string | null
          experience_level?: string | null
          id?: string
          is_open?: boolean | null
          requirements?: string | null
          salary_range?: string | null
          skills_required?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_positions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      business_reviews: {
        Row: {
          business_id: string
          content: string | null
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          rating: number
          reviewer_id: string
          reviewer_type: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          rating: number
          reviewer_id: string
          reviewer_type?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          rating?: number
          reviewer_id?: string
          reviewer_type?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_listings"
            referencedColumns: ["id"]
          },
        ]
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
      hiring_pipeline: {
        Row: {
          application_id: string
          business_id: string
          created_at: string | null
          id: string
          interview_date: string | null
          interview_link: string | null
          interview_type: string | null
          notes: string | null
          stage: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          application_id: string
          business_id: string
          created_at?: string | null
          id?: string
          interview_date?: string | null
          interview_link?: string | null
          interview_type?: string | null
          notes?: string | null
          stage?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          application_id?: string
          business_id?: string
          created_at?: string | null
          id?: string
          interview_date?: string | null
          interview_link?: string | null
          interview_type?: string | null
          notes?: string | null
          stage?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hiring_pipeline_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "business_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hiring_pipeline_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      inbox_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inbox_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbox_messages_sender_id_fkey"
            columns: ["sender_id"]
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
      job_applications: {
        Row: {
          admin_notes: string | null
          availability: string | null
          bio: string | null
          categories: string[] | null
          created_at: string | null
          email: string
          experience_level: string
          full_name: string
          hourly_rate: number | null
          id: string
          phone: string | null
          portfolio_link: string | null
          profile_photo_url: string | null
          purpose: string
          resume_url: string | null
          skills: string[] | null
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          availability?: string | null
          bio?: string | null
          categories?: string[] | null
          created_at?: string | null
          email: string
          experience_level?: string
          full_name: string
          hourly_rate?: number | null
          id?: string
          phone?: string | null
          portfolio_link?: string | null
          profile_photo_url?: string | null
          purpose: string
          resume_url?: string | null
          skills?: string[] | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          availability?: string | null
          bio?: string | null
          categories?: string[] | null
          created_at?: string | null
          email?: string
          experience_level?: string
          full_name?: string
          hourly_rate?: number | null
          id?: string
          phone?: string | null
          portfolio_link?: string | null
          profile_photo_url?: string | null
          purpose?: string
          resume_url?: string | null
          skills?: string[] | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      job_offers: {
        Row: {
          applicant_email: string
          application_id: string
          benefits: string[] | null
          business_id: string
          created_at: string | null
          id: string
          position_title: string
          responded_at: string | null
          salary: string | null
          sent_at: string | null
          start_date: string | null
          status: string
          terms: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_email: string
          application_id: string
          benefits?: string[] | null
          business_id: string
          created_at?: string | null
          id?: string
          position_title: string
          responded_at?: string | null
          salary?: string | null
          sent_at?: string | null
          start_date?: string | null
          status?: string
          terms?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_email?: string
          application_id?: string
          benefits?: string[] | null
          business_id?: string
          created_at?: string | null
          id?: string
          position_title?: string
          responded_at?: string | null
          salary?: string | null
          sent_at?: string | null
          start_date?: string | null
          status?: string
          terms?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "business_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_offers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      member_permissions: {
        Row: {
          allowed: boolean | null
          created_at: string | null
          granted_by: string | null
          id: string
          permission_key: string
          user_id: string
        }
        Insert: {
          allowed?: boolean | null
          created_at?: string | null
          granted_by?: string | null
          id?: string
          permission_key: string
          user_id: string
        }
        Update: {
          allowed?: boolean | null
          created_at?: string | null
          granted_by?: string | null
          id?: string
          permission_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          project_url: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          project_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          project_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          job_title: string | null
          onboarding_completed: boolean | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          job_title?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
          user_type?: string | null
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
