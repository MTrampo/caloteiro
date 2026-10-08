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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      config_plans: {
        Row: {
          created_at: string | null
          history_retention_days: number
          id: string
          is_default: boolean
          max_procedures: number
          max_users: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          history_retention_days?: number
          id?: string
          is_default?: boolean
          max_procedures?: number
          max_users?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          history_retention_days?: number
          id?: string
          is_default?: boolean
          max_procedures?: number
          max_users?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          birthday: string | null
          created_at: string | null
          email: string | null
          establishment_id: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          birthday?: string | null
          created_at?: string | null
          email?: string | null
          establishment_id: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          birthday?: string | null
          created_at?: string | null
          email?: string | null
          establishment_id?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      establishments: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string
          opening_hours: Json | null
          owner_id: string
          phone: string | null
          slug: string
          subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name: string
          opening_hours?: Json | null
          owner_id: string
          phone?: string | null
          slug: string
          subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          opening_hours?: Json | null
          owner_id?: string
          phone?: string | null
          slug?: string
          subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "establishments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          establishment_id: string | null
          id: string
          mp_invoice_id: string
          mp_payer_email: string | null
          mp_payer_id: number | null
          mp_preapproval_id: string | null
          mp_subscription_id: string | null
          paid_at: string | null
          raw_payload: Json | null
          status: string | null
          subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          establishment_id?: string | null
          id?: string
          mp_invoice_id: string
          mp_payer_email?: string | null
          mp_payer_id?: number | null
          mp_preapproval_id?: string | null
          mp_subscription_id?: string | null
          paid_at?: string | null
          raw_payload?: Json | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          establishment_id?: string | null
          id?: string
          mp_invoice_id?: string
          mp_payer_email?: string | null
          mp_payer_id?: number | null
          mp_preapproval_id?: string | null
          mp_subscription_id?: string | null
          paid_at?: string | null
          raw_payload?: Json | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_invitations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          max_uses: number
          plan_slug: string
          recipient_email: string | null
          recipient_name: string | null
          token: string
          used_at: string | null
          used_by_user_id: string | null
          used_count: number
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number
          plan_slug: string
          recipient_email?: string | null
          recipient_name?: string | null
          token: string
          used_at?: string | null
          used_by_user_id?: string | null
          used_count?: number
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number
          plan_slug?: string
          recipient_email?: string | null
          recipient_name?: string | null
          token?: string
          used_at?: string | null
          used_by_user_id?: string | null
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_invitations_plan_slug_fkey"
            columns: ["plan_slug"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["slug"]
          },
        ]
      }
      plans: {
        Row: {
          badge: string | null
          billing_period: string | null
          config_plan_id: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          mp_plan_id: string
          name: string
          price: number
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          badge?: string | null
          billing_period?: string | null
          config_plan_id?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          mp_plan_id: string
          name: string
          price: number
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          badge?: string | null
          billing_period?: string | null
          config_plan_id?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          mp_plan_id?: string
          name?: string
          price?: number
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plans_config_plan_id_fkey"
            columns: ["config_plan_id"]
            isOneToOne: false
            referencedRelation: "config_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number
          establishment_id: string
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration: number
          establishment_id: string
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number
          establishment_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      schedule_blocks: {
        Row: {
          created_at: string | null
          date: string | null
          day_of_week: number | null
          end_time: string
          establishment_id: string
          id: string
          reason: string | null
          recurring_type: number | null
          start_time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          day_of_week?: number | null
          end_time: string
          establishment_id: string
          id?: string
          reason?: string | null
          recurring_type?: number | null
          start_time: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          day_of_week?: number | null
          end_time?: string
          establishment_id?: string
          id?: string
          reason?: string | null
          recurring_type?: number | null
          start_time?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_blocks_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_procedures: {
        Row: {
          duration_at_time: number
          price_at_time: number
          procedure_id: string
          schedule_id: string
        }
        Insert: {
          duration_at_time: number
          price_at_time: number
          procedure_id: string
          schedule_id: string
        }
        Update: {
          duration_at_time?: number
          price_at_time?: number
          procedure_id?: string
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_procedures_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_procedures_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string | null
          customer_id: string
          end_at: string
          establishment_id: string
          id: string
          notes: string | null
          start_at: string
          status: number
          total_duration: number
          total_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          end_at: string
          establishment_id: string
          id?: string
          notes?: string | null
          start_at: string
          status?: number
          total_duration: number
          total_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          end_at?: string
          establishment_id?: string
          id?: string
          notes?: string | null
          start_at?: string
          status?: number
          total_duration?: number
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_cancellation_reasons: {
        Row: {
          created_at: string | null
          establishment_id: string | null
          id: string
          mp_subscription_id: string | null
          reason: string
          reason_details: string | null
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          establishment_id?: string | null
          id?: string
          mp_subscription_id?: string | null
          reason: string
          reason_details?: string | null
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          establishment_id?: string | null
          id?: string
          mp_subscription_id?: string | null
          reason?: string
          reason_details?: string | null
          subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_cancellation_reasons_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_cancellation_reasons_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_inconsistencies: {
        Row: {
          created_at: string | null
          id: string
          issue_reason: string | null
          mp_payer_id: number | null
          mp_preapproval_id: string
          payer_email_received: string | null
          payment: string | null
          preapproval_data: Json | null
          resolved: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          issue_reason?: string | null
          mp_payer_id?: number | null
          mp_preapproval_id: string
          payer_email_received?: string | null
          payment?: string | null
          preapproval_data?: Json | null
          resolved?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          issue_reason?: string | null
          mp_payer_id?: number | null
          mp_preapproval_id?: string
          payer_email_received?: string | null
          payment?: string | null
          preapproval_data?: Json | null
          resolved?: boolean | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          base_value: number
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          extra_user_price: number | null
          extra_users_count: number | null
          id: string
          mp_payer_email: string | null
          mp_payer_id: number | null
          mp_preapproval_plan_id: string | null
          mp_status: string
          mp_subscription_id: string | null
          plan_name: string | null
          updated_at: string | null
        }
        Insert: {
          base_value: number
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          extra_user_price?: number | null
          extra_users_count?: number | null
          id?: string
          mp_payer_email?: string | null
          mp_payer_id?: number | null
          mp_preapproval_plan_id?: string | null
          mp_status?: string
          mp_subscription_id?: string | null
          plan_name?: string | null
          updated_at?: string | null
        }
        Update: {
          base_value?: number
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          extra_user_price?: number | null
          extra_users_count?: number | null
          id?: string
          mp_payer_email?: string | null
          mp_payer_id?: number | null
          mp_preapproval_plan_id?: string | null
          mp_status?: string
          mp_subscription_id?: string | null
          plan_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          origin: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          origin?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          origin?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
