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
      kyc_submissions: {
        Row: {
          additional_citizenships: string | null
          address_line1: string | null
          address_line2: string | null
          annual_income: string | null
          city: string | null
          completed_at: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          document_expiry_date: string | null
          document_file_url: string | null
          document_number: string | null
          document_type: string | null
          employer: string | null
          first_name: string | null
          id: string
          is_us_person: boolean | null
          issuing_country: string | null
          last_name: string | null
          length_of_residence: string | null
          nationality: string | null
          occupation: string | null
          place_of_birth: string | null
          postal_code: string | null
          source_of_funds: string | null
          source_of_wealth: string | null
          state: string | null
          step_1_completed: boolean | null
          step_2_completed: boolean | null
          step_3_completed: boolean | null
          step_4_completed: boolean | null
          tax_identification_numbers: string | null
          tax_residency_countries: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_citizenships?: string | null
          address_line1?: string | null
          address_line2?: string | null
          annual_income?: string | null
          city?: string | null
          completed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          document_expiry_date?: string | null
          document_file_url?: string | null
          document_number?: string | null
          document_type?: string | null
          employer?: string | null
          first_name?: string | null
          id?: string
          is_us_person?: boolean | null
          issuing_country?: string | null
          last_name?: string | null
          length_of_residence?: string | null
          nationality?: string | null
          occupation?: string | null
          place_of_birth?: string | null
          postal_code?: string | null
          source_of_funds?: string | null
          source_of_wealth?: string | null
          state?: string | null
          step_1_completed?: boolean | null
          step_2_completed?: boolean | null
          step_3_completed?: boolean | null
          step_4_completed?: boolean | null
          tax_identification_numbers?: string | null
          tax_residency_countries?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_citizenships?: string | null
          address_line1?: string | null
          address_line2?: string | null
          annual_income?: string | null
          city?: string | null
          completed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          document_expiry_date?: string | null
          document_file_url?: string | null
          document_number?: string | null
          document_type?: string | null
          employer?: string | null
          first_name?: string | null
          id?: string
          is_us_person?: boolean | null
          issuing_country?: string | null
          last_name?: string | null
          length_of_residence?: string | null
          nationality?: string | null
          occupation?: string | null
          place_of_birth?: string | null
          postal_code?: string | null
          source_of_funds?: string | null
          source_of_wealth?: string | null
          state?: string | null
          step_1_completed?: boolean | null
          step_2_completed?: boolean | null
          step_3_completed?: boolean | null
          step_4_completed?: boolean | null
          tax_identification_numbers?: string | null
          tax_residency_countries?: string | null
          updated_at?: string
          user_id?: string
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
