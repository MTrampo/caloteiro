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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      config_plans: {
        Row: {
          can_access_financial: boolean | null
          can_attach_receipts: boolean | null
          can_debtor_portal: boolean | null
          can_risk_score: boolean | null
          created_at: string | null
          custom_templates: boolean | null
          export_reports: boolean | null
          id: string
          is_default: boolean | null
          max_debtors: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          can_access_financial?: boolean | null
          can_attach_receipts?: boolean | null
          can_debtor_portal?: boolean | null
          can_risk_score?: boolean | null
          created_at?: string | null
          custom_templates?: boolean | null
          export_reports?: boolean | null
          id?: string
          is_default?: boolean | null
          max_debtors?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          can_access_financial?: boolean | null
          can_attach_receipts?: boolean | null
          can_debtor_portal?: boolean | null
          can_risk_score?: boolean | null
          created_at?: string | null
          custom_templates?: boolean | null
          export_reports?: boolean | null
          id?: string
          is_default?: boolean | null
          max_debtors?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      creditor_settings: {
        Row: {
          created_at: string | null
          default_interest_rate: number | null
          default_interest_type: string | null
          id: string
          pix_bank_name: string | null
          pix_holder_name: string | null
          pix_key: string | null
          pix_key_type: string | null
          template_acid: string | null
          template_critical: string | null
          template_friendly: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_interest_rate?: number | null
          default_interest_type?: string | null
          id?: string
          pix_bank_name?: string | null
          pix_holder_name?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          template_acid?: string | null
          template_critical?: string | null
          template_friendly?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_interest_rate?: number | null
          default_interest_type?: string | null
          id?: string
          pix_bank_name?: string | null
          pix_holder_name?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          template_acid?: string | null
          template_critical?: string | null
          template_friendly?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creditor_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_excuses: {
        Row: {
          created_at: string | null
          debtor_id: string
          excuse_text: string
          id: string
          installment_id: string
          promised_date: string
          user_id: string
          was_honored: boolean | null
        }
        Insert: {
          created_at?: string | null
          debtor_id: string
          excuse_text: string
          id?: string
          installment_id: string
          promised_date: string
          user_id: string
          was_honored?: boolean | null
        }
        Update: {
          created_at?: string | null
          debtor_id?: string
          excuse_text?: string
          id?: string
          installment_id?: string
          promised_date?: string
          user_id?: string
          was_honored?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "debt_excuses_debtor_id_fkey"
            columns: ["debtor_id"]
            isOneToOne: false
            referencedRelation: "debtors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_excuses_installment_id_fkey"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "installments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_excuses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_payments: {
        Row: {
          amount: number
          created_at: string | null
          debt_id: string
          debtor_id: string
          id: string
          notes: string | null
          paid_at: string
          receipt_path?: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          debt_id: string
          debtor_id: string
          id?: string
          notes?: string | null
          paid_at?: string
          receipt_path?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          debt_id?: string
          debtor_id?: string
          id?: string
          notes?: string | null
          paid_at?: string
          receipt_path?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_payments_debtor_id_fkey"
            columns: ["debtor_id"]
            isOneToOne: false
            referencedRelation: "debtors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debtors: {
        Row: {
          address: string | null
          created_at: string | null
          document: string | null
          id: string
          is_archived: boolean | null
          name: string
          nickname: string | null
          notes: string | null
          phone: string
          pix_key: string | null
          pix_key_type: string | null
          relationship: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          document?: string | null
          id?: string
          is_archived?: boolean | null
          name: string
          nickname?: string | null
          notes?: string | null
          phone: string
          pix_key?: string | null
          pix_key_type?: string | null
          relationship?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          document?: string | null
          id?: string
          is_archived?: boolean | null
          name?: string
          nickname?: string | null
          notes?: string | null
          phone?: string
          pix_key?: string | null
          pix_key_type?: string | null
          relationship?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debtors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          category: string
          created_at: string | null
          debtor_id: string
          first_due_date: string
          id: string
          installments_count: number
          interest_rate: number | null
          interest_type: string | null
          loan_date: string
          loan_receipt_path?: string | null
          max_late_installments?: number | null
          notes: string | null
          original_amount: number
          payment_method: string
          public_access_code?: string
          public_link_enabled?: boolean
          settled_at: string | null
          show_notes_on_invoice?: boolean
          status: string
          title: string
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          debtor_id: string
          first_due_date: string
          id?: string
          installments_count?: number
          interest_rate?: number | null
          interest_type?: string | null
          loan_date?: string
          loan_receipt_path?: string | null
          max_late_installments?: number | null
          notes?: string | null
          original_amount: number
          payment_method?: string
          public_access_code?: string
          public_link_enabled?: boolean
          settled_at?: string | null
          show_notes_on_invoice?: boolean
          status?: string
          title: string
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          debtor_id?: string
          first_due_date?: string
          id?: string
          installments_count?: number
          interest_rate?: number | null
          interest_type?: string | null
          loan_date?: string
          loan_receipt_path?: string | null
          max_late_installments?: number | null
          notes?: string | null
          original_amount?: number
          payment_method?: string
          public_access_code?: string
          public_link_enabled?: boolean
          settled_at?: string | null
          show_notes_on_invoice?: boolean
          status?: string
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debts_debtor_id_fkey"
            columns: ["debtor_id"]
            isOneToOne: false
            referencedRelation: "debtors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      installments: {
        Row: {
          created_at: string | null
          debt_id: string
          debtor_id: string
          due_date: string
          id: string
          installment_number: number
          nominal_amount: number
          paid_amount: number
          receipt_path?: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debt_id: string
          debtor_id: string
          due_date: string
          id?: string
          installment_number: number
          nominal_amount: number
          paid_amount?: number
          receipt_path?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          debt_id?: string
          debtor_id?: string
          due_date?: string
          id?: string
          installment_number?: number
          nominal_amount?: number
          paid_amount?: number
          receipt_path?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "installments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installments_debtor_id_fkey"
            columns: ["debtor_id"]
            isOneToOne: false
            referencedRelation: "debtors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          mp_invoice_id: string | null
          mp_subscription_id: string | null
          paid_at: string | null
          raw_payload: Json | null
          status: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          mp_invoice_id?: string | null
          mp_subscription_id?: string | null
          paid_at?: string | null
          raw_payload?: Json | null
          status: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          mp_invoice_id?: string | null
          mp_subscription_id?: string | null
          paid_at?: string | null
          raw_payload?: Json | null
          status?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          badge: string | null
          billing_period: string | null
          button: string | null
          config_plan_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          mp_plan_id: string | null
          name: string
          price: number
          shark: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          badge?: string | null
          billing_period?: string | null
          button?: string | null
          config_plan_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          mp_plan_id?: string | null
          name: string
          price: number
          shark?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          badge?: string | null
          billing_period?: string | null
          button?: string | null
          config_plan_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          mp_plan_id?: string | null
          name?: string
          price?: number
          shark?: string | null
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
      profiles: {
        Row: {
          accepted_terms: boolean | null
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          name: string | null
          nickname: string | null
          phone: string | null
          retention_until: string | null
          status: "active" | "deleted" | "banned" | "suspended"
          status_reason: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_terms?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          nickname?: string | null
          phone?: string | null
          retention_until?: string | null
          status?: "active" | "deleted" | "banned" | "suspended"
          status_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_terms?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          nickname?: string | null
          phone?: string | null
          retention_until?: string | null
          status?: "active" | "deleted" | "banned" | "suspended"
          status_reason?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_cancellations: {
        Row: {
          created_at: string | null
          id: string
          mp_subscription_id: string | null
          reason: string
          reason_details: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mp_subscription_id?: string | null
          reason: string
          reason_details?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mp_subscription_id?: string | null
          reason?: string
          reason_details?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_cancellations_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_cancellations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          base_value: number
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          mp_payer_email: string | null
          mp_payer_id: number | null
          mp_status: string | null
          mp_subscription_id: string | null
          plan_id: string | null
          scheduled_plan_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          base_value: number
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          mp_payer_email?: string | null
          mp_payer_id?: number | null
          mp_status?: string | null
          mp_subscription_id?: string | null
          plan_id?: string | null
          scheduled_plan_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          base_value?: number
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          mp_payer_email?: string | null
          mp_payer_id?: number | null
          mp_status?: string | null
          mp_subscription_id?: string | null
          plan_id?: string | null
          scheduled_plan_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_scheduled_plan_id_fkey"
            columns: ["scheduled_plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
