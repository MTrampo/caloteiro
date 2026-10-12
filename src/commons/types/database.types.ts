export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          nickname: string | null;
          email: string | null;
          avatar_url: string | null;
          phone: string | null;
          accepted_terms: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          nickname?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          accepted_terms?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          nickname?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          accepted_terms?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      config_plans: {
        Row: {
          id: string;
          name: string;
          max_debtors: number | null;
          custom_templates: boolean;
          export_reports: boolean;
          can_access_financial: boolean;
          can_debtor_portal: boolean;
          can_risk_score: boolean;
          can_attach_receipts: boolean;
          is_default: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          max_debtors?: number | null;
          custom_templates?: boolean;
          export_reports?: boolean;
          can_access_financial?: boolean;
          can_debtor_portal?: boolean;
          can_risk_score?: boolean;
          can_attach_receipts?: boolean;
          is_default?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          max_debtors?: number | null;
          custom_templates?: boolean;
          export_reports?: boolean;
          can_access_financial?: boolean;
          can_debtor_portal?: boolean;
          can_risk_score?: boolean;
          can_attach_receipts?: boolean;
          is_default?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          config_plan_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          billing_period: string | null;
          mp_plan_id: string | null;
          badge: string | null;
          is_featured: boolean | null;
          is_active: boolean | null;
          sort_order: number | null;
          created_at: string | null;
          updated_at: string | null;
          shark: string | null;
          button: string | null;
        };
        Insert: {
          id?: string;
          config_plan_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          billing_period?: string | null;
          mp_plan_id?: string | null;
          badge?: string | null;
          is_featured?: boolean | null;
          is_active?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          shark?: string | null;
          button?: string | null;
        };
        Update: {
          id?: string;
          config_plan_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          billing_period?: string | null;
          mp_plan_id?: string | null;
          badge?: string | null;
          is_featured?: boolean | null;
          is_active?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          shark?: string | null;
          button?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "plans_config_plan_id_fkey";
            columns: ["config_plan_id"];
            isOneToOne: false;
            referencedRelation: "config_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string | null;
          mp_subscription_id: string | null;
          mp_payer_id: number | null;
          mp_payer_email: string | null;
          mp_status: string;
          base_value: number;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id?: string | null;
          mp_subscription_id?: string | null;
          mp_payer_id?: number | null;
          mp_payer_email?: string | null;
          mp_status?: string;
          base_value: number;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string | null;
          mp_subscription_id?: string | null;
          mp_payer_id?: number | null;
          mp_payer_email?: string | null;
          mp_status?: string;
          base_value?: number;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          mp_invoice_id: string | null;
          mp_subscription_id: string | null;
          amount: number;
          currency: string | null;
          status: string;
          paid_at: string | null;
          raw_payload: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id?: string | null;
          mp_invoice_id?: string | null;
          mp_subscription_id?: string | null;
          amount: number;
          currency?: string | null;
          status: string;
          paid_at?: string | null;
          raw_payload?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string | null;
          mp_invoice_id?: string | null;
          mp_subscription_id?: string | null;
          amount?: number;
          currency?: string | null;
          status?: string;
          paid_at?: string | null;
          raw_payload?: Json | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      subscription_cancellations: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          mp_subscription_id: string | null;
          reason: string;
          reason_details: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id?: string | null;
          mp_subscription_id?: string | null;
          reason: string;
          reason_details?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string | null;
          mp_subscription_id?: string | null;
          reason?: string;
          reason_details?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscription_cancellations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      creditor_settings: {
        Row: {
          id: string;
          user_id: string;
          pix_key_type: string | null;
          pix_key: string | null;
          pix_holder_name: string | null;
          pix_bank_name: string | null;
          template_friendly: string | null;
          template_acid: string | null;
          template_critical: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          pix_key_type?: string | null;
          pix_key?: string | null;
          pix_holder_name?: string | null;
          pix_bank_name?: string | null;
          template_friendly?: string | null;
          template_acid?: string | null;
          template_critical?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          pix_key_type?: string | null;
          pix_key?: string | null;
          pix_holder_name?: string | null;
          pix_bank_name?: string | null;
          template_friendly?: string | null;
          template_acid?: string | null;
          template_critical?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "creditor_settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      debtors: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          nickname: string | null;
          relationship: number;
          document: string | null;
          address: string | null;
          phone: string;
          pix_key: string | null;
          pix_key_type: string | null;
          notes: string | null;
          is_archived: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          nickname?: string | null;
          relationship?: number;
          document?: string | null;
          address?: string | null;
          phone: string;
          pix_key?: string | null;
          pix_key_type?: string | null;
          notes?: string | null;
          is_archived?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          nickname?: string | null;
          relationship?: number;
          document?: string | null;
          address?: string | null;
          phone?: string;
          pix_key?: string | null;
          pix_key_type?: string | null;
          notes?: string | null;
          is_archived?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "debtors_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;
