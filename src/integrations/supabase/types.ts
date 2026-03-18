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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          badge_type: string
          created_at: string
          from_user_id: string
          id: string
          to_user_id: string
        }
        Insert: {
          badge_type: string
          created_at?: string
          from_user_id: string
          id?: string
          to_user_id: string
        }
        Update: {
          badge_type?: string
          created_at?: string
          from_user_id?: string
          id?: string
          to_user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          bloating: number
          created_at: string
          energy: number
          foods_eaten: string[] | null
          id: string
          mood: number
          off_plan_foods: string[] | null
          plan_adherence: string | null
          plan_foods_followed: string[] | null
          sleep_hours: number | null
          stress: number | null
          user_id: string
        }
        Insert: {
          bloating: number
          created_at?: string
          energy: number
          foods_eaten?: string[] | null
          id?: string
          mood: number
          off_plan_foods?: string[] | null
          plan_adherence?: string | null
          plan_foods_followed?: string[] | null
          sleep_hours?: number | null
          stress?: number | null
          user_id: string
        }
        Update: {
          bloating?: number
          created_at?: string
          energy?: number
          foods_eaten?: string[] | null
          id?: string
          mood?: number
          off_plan_foods?: string[] | null
          plan_adherence?: string | null
          plan_foods_followed?: string[] | null
          sleep_hours?: number | null
          stress?: number | null
          user_id?: string
        }
        Relationships: []
      }
      fasting_sessions: {
        Row: {
          completed: boolean
          created_at: string
          ended_at: string | null
          id: string
          protocol: string
          started_at: string
          target_hours: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          ended_at?: string | null
          id?: string
          protocol?: string
          started_at?: string
          target_hours?: number
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          ended_at?: string | null
          id?: string
          protocol?: string
          started_at?: string
          target_hours?: number
          user_id?: string
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed_at: string
          created_at: string
          habit_id: string
          habit_title: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          habit_id: string
          habit_title: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          habit_id?: string
          habit_title?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      health_documents: {
        Row: {
          ai_analysis: Json | null
          ai_meal_plan: Json | null
          created_at: string
          doc_type: string
          file_name: string | null
          file_path: string | null
          id: string
          manual_content: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          ai_meal_plan?: Json | null
          created_at?: string
          doc_type: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          manual_content?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          ai_meal_plan?: Json | null
          created_at?: string
          doc_type?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          manual_content?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          accepted_by: string | null
          created_at: string
          from_user_id: string
          id: string
          invite_code: string
        }
        Insert: {
          accepted_by?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          invite_code?: string
        }
        Update: {
          accepted_by?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          invite_code?: string
        }
        Relationships: []
      }
      partnerships: {
        Row: {
          created_at: string
          id: string
          partner_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          partner_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          partner_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity: string | null
          age: string | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          body_frame: string | null
          city: string | null
          created_at: string
          current_streak: number | null
          custom_intolerances: string[] | null
          difficulty: string | null
          fasting_enabled: boolean
          fasting_hours: number | null
          fasting_protocol: string | null
          fasting_start_hour: number | null
          height: number | null
          id: string
          intolerances: string[] | null
          last_check_in_date: string | null
          mode: string | null
          name: string
          objective: string | null
          pace: string | null
          partner_name: string | null
          province: string | null
          region: string | null
          sex: string | null
          updated_at: string
          user_id: string
          weight: number | null
          work_type: string | null
        }
        Insert: {
          activity?: string | null
          age?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          body_frame?: string | null
          city?: string | null
          created_at?: string
          current_streak?: number | null
          custom_intolerances?: string[] | null
          difficulty?: string | null
          fasting_enabled?: boolean
          fasting_hours?: number | null
          fasting_protocol?: string | null
          fasting_start_hour?: number | null
          height?: number | null
          id?: string
          intolerances?: string[] | null
          last_check_in_date?: string | null
          mode?: string | null
          name?: string
          objective?: string | null
          pace?: string | null
          partner_name?: string | null
          province?: string | null
          region?: string | null
          sex?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
          work_type?: string | null
        }
        Update: {
          activity?: string | null
          age?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          body_frame?: string | null
          city?: string | null
          created_at?: string
          current_streak?: number | null
          custom_intolerances?: string[] | null
          difficulty?: string | null
          fasting_enabled?: boolean
          fasting_hours?: number | null
          fasting_protocol?: string | null
          fasting_start_hour?: number | null
          height?: number | null
          id?: string
          intolerances?: string[] | null
          last_check_in_date?: string | null
          mode?: string | null
          name?: string
          objective?: string | null
          pace?: string | null
          partner_name?: string | null
          province?: string | null
          region?: string | null
          sex?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
          work_type?: string | null
        }
        Relationships: []
      }
      weekly_checkins: {
        Row: {
          bloating: number
          created_at: string
          energy: number
          id: string
          notes: string | null
          user_id: string
          week_number: number
          weight: number | null
        }
        Insert: {
          bloating: number
          created_at?: string
          energy: number
          id?: string
          notes?: string | null
          user_id: string
          week_number: number
          weight?: number | null
        }
        Update: {
          bloating?: number
          created_at?: string
          energy?: number
          id?: string
          notes?: string | null
          user_id?: string
          week_number?: number
          weight?: number | null
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string
          id: string
          logged_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          logged_at?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          id?: string
          logged_at?: string
          user_id?: string
          weight?: number
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
