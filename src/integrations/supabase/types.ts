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
      alumni_profiles: {
        Row: {
          admission_year: number | null
          avatar_url: string | null
          batch_end: number | null
          batch_start: number | null
          branch: string | null
          course: string | null
          created_at: string
          email: string
          full_name: string
          github_url: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          original_user_id: string | null
          whatsapp_url: string | null
        }
        Insert: {
          admission_year?: number | null
          avatar_url?: string | null
          batch_end?: number | null
          batch_start?: number | null
          branch?: string | null
          course?: string | null
          created_at?: string
          email: string
          full_name: string
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          original_user_id?: string | null
          whatsapp_url?: string | null
        }
        Update: {
          admission_year?: number | null
          avatar_url?: string | null
          batch_end?: number | null
          batch_start?: number | null
          branch?: string | null
          course?: string | null
          created_at?: string
          email?: string
          full_name?: string
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          original_user_id?: string | null
          whatsapp_url?: string | null
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_email_jobs: {
        Row: {
          created_at: string
          email: string
          error_message: string | null
          failed_at: string | null
          id: string
          job_type: string
          provider_message_id: string | null
          scheduled_for: string
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          job_type: string
          provider_message_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          job_type?: string
          provider_message_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      email_delivery_events: {
        Row: {
          bounce_status: string
          created_at: string
          email: string
          event_type: string
          id: string
          payload: Json
          provider: string
          provider_event_id: string | null
        }
        Insert: {
          bounce_status?: string
          created_at?: string
          email: string
          event_type: string
          id?: string
          payload?: Json
          provider?: string
          provider_event_id?: string | null
        }
        Update: {
          bounce_status?: string
          created_at?: string
          email?: string
          event_type?: string
          id?: string
          payload?: Json
          provider?: string
          provider_event_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          post_id: string | null
          read: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          read?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          read?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          hashtags: string[] | null
          id: string
          image_url: string | null
          likes_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_expires_at: string | null
          admission_year: number | null
          alumni_opt_in: boolean
          avatar_url: string | null
          batch_end: number | null
          batch_start: number | null
          bio: string | null
          branch: string | null
          course: string | null
          course_duration_years: number | null
          created_at: string
          deletion_scheduled_at: string | null
          email: string
          email_bounce_status: string
          expected_completion_year: number | null
          extended_until: string | null
          full_name: string
          github_url: string | null
          id: string
          instagram_url: string | null
          interests: string[] | null
          last_email_bounce_at: string | null
          last_email_sent_at: string | null
          last_revalidated_at: string
          lifecycle_status: string
          linkedin_url: string | null
          onboarding_completed: boolean | null
          permanently_delete_after: string | null
          privacy_accepted: boolean
          revalidation_count: number
          restricted_at: string | null
          revalidation_grace_until: string | null
          revalidation_method: string | null
          terms_accepted: boolean | null
          updated_at: string
          user_id: string
          whatsapp_url: string | null
        }
        Insert: {
          account_expires_at?: string | null
          admission_year?: number | null
          alumni_opt_in?: boolean
          avatar_url?: string | null
          batch_end?: number | null
          batch_start?: number | null
          bio?: string | null
          branch?: string | null
          course?: string | null
          course_duration_years?: number | null
          created_at?: string
          deletion_scheduled_at?: string | null
          email?: string
          email_bounce_status?: string
          expected_completion_year?: number | null
          extended_until?: string | null
          full_name?: string
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          interests?: string[] | null
          last_email_bounce_at?: string | null
          last_email_sent_at?: string | null
          last_revalidated_at?: string
          lifecycle_status?: string
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          permanently_delete_after?: string | null
          privacy_accepted?: boolean
          revalidation_count?: number
          restricted_at?: string | null
          revalidation_grace_until?: string | null
          revalidation_method?: string | null
          terms_accepted?: boolean | null
          updated_at?: string
          user_id: string
          whatsapp_url?: string | null
        }
        Update: {
          account_expires_at?: string | null
          admission_year?: number | null
          alumni_opt_in?: boolean
          avatar_url?: string | null
          batch_end?: number | null
          batch_start?: number | null
          bio?: string | null
          branch?: string | null
          course?: string | null
          course_duration_years?: number | null
          created_at?: string
          deletion_scheduled_at?: string | null
          email?: string
          email_bounce_status?: string
          expected_completion_year?: number | null
          extended_until?: string | null
          full_name?: string
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          interests?: string[] | null
          last_email_bounce_at?: string | null
          last_email_sent_at?: string | null
          last_revalidated_at?: string
          lifecycle_status?: string
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          permanently_delete_after?: string | null
          privacy_accepted?: boolean
          revalidation_count?: number
          restricted_at?: string | null
          revalidation_grace_until?: string | null
          revalidation_method?: string | null
          terms_accepted?: boolean | null
          updated_at?: string
          user_id?: string
          whatsapp_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_profile_to_alumni: {
        Args: {
          target_profile: Database["public"]["Tables"]["profiles"]["Row"]
        }
        Returns: undefined
      }
      compute_expected_completion_year: {
        Args: {
          admission_year: number
          duration_years: number
        }
        Returns: number
      }
      derive_admission_year_from_email: {
        Args: {
          target_email: string
        }
        Returns: number
      }
      mark_profile_revalidated: {
        Args: {
          target_user_id: string
          method?: string
        }
        Returns: Database["public"]["Tables"]["profiles"]["Row"]
      }
      queue_lifecycle_email: {
        Args: {
          target_user_id: string
          target_email: string
          target_job_type: string
          send_after?: string
        }
        Returns: undefined
      }
      record_email_delivery_event: {
        Args: {
          target_email: string
          event_type: string
          bounce_status?: string
          provider?: string
          provider_event_id?: string | null
          payload?: Json
        }
        Returns: undefined
      }
      process_profile_lifecycle: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
