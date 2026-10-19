export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      course_questions: {
        Row: {
          answer: string | null;
          answered_at: string | null;
          body: string;
          course_id: string;
          created_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          answer?: string | null;
          answered_at?: string | null;
          body: string;
          course_id: string;
          created_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          answer?: string | null;
          answered_at?: string | null;
          body?: string;
          course_id?: string;
          created_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "course_questions_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "course_questions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      course_ratings: {
        Row: {
          course_id: string;
          created_at: string;
          id: string;
          rating: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          course_id: string;
          created_at?: string;
          id?: string;
          rating: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          course_id?: string;
          created_at?: string;
          id?: string;
          rating?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "course_ratings_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "course_ratings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      courses: {
        Row: {
          author_id: string;
          category: string;
          created_at: string;
          description: string | null;
          id: string;
          is_public: boolean;
          level: string;
          password_hash: string | null;
          slug: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          category?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          level?: string;
          password_hash?: string | null;
          slug: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          category?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          level?: string;
          password_hash?: string | null;
          slug?: string;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "courses_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      enrollments: {
        Row: {
          course_id: string;
          enrolled_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          course_id: string;
          enrolled_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          course_id?: string;
          enrolled_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_attachments: {
        Row: {
          file_name: string;
          file_size: number;
          file_type: string;
          id: string;
          lesson_id: string;
          storage_path: string;
          uploaded_at: string;
        };
        Insert: {
          file_name: string;
          file_size: number;
          file_type: string;
          id?: string;
          lesson_id: string;
          storage_path: string;
          uploaded_at?: string;
        };
        Update: {
          file_name?: string;
          file_size?: number;
          file_type?: string;
          id?: string;
          storage_path?: string;
          lesson_id?: string;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_attachments_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_completions: {
        Row: {
          completed_at: string;
          lesson_id: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string;
          lesson_id: string;
          user_id: string;
        };
        Update: {
          completed_at?: string;
          lesson_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_completions_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_completions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          content: string | null;
          course_id: string;
          created_at: string;
          id: string;
          order_index: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          content?: string | null;
          course_id: string;
          created_at?: string;
          id?: string;
          order_index: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string | null;
          course_id?: string;
          created_at?: string;
          id?: string;
          order_index?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          email: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          role: string;
          updated_at: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          role?: string;
          updated_at?: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          role?: string;
          updated_at?: string;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_course_progress: {
        Args: { p_course_id: string };
        Returns: {
          course_id: string;
          course_title: string;
          description: string;
          is_completed: boolean;
          is_enrolled: boolean;
          is_public: boolean;
          lesson_content: string;
          lesson_id: string;
          lesson_position: number;
          lesson_title: string;
        }[];
      };
      get_course_roster: {
        Args: { p_course_id: string };
        Returns: {
          completed_lessons: number;
          display_name: string;
          email: string;
          enrolled_at: string;
          total_lessons: number;
          user_id: string;
          username: string;
        }[];
      };
      get_enrolled_courses: {
        Args: Record<PropertyKey, never>;
        Returns: {
          author_name: string;
          completed_lessons: number;
          course_id: string;
          course_title: string;
          description: string;
          enrolled_at: string;
          is_public: boolean;
          last_activity_at: string;
          lesson_count: number;
        }[];
      };
      get_published_catalogue: {
        Args: Record<PropertyKey, never>;
        Returns: {
          author_name: string;
          avg_rating: number;
          category: string;
          description: string;
          id: string;
          is_public: boolean;
          lesson_count: number;
          level: string;
          rating_count: number;
          student_count: number;
          title: string;
          updated_at: string;
        }[];
      };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
