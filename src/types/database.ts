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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      action_items: {
        Row: {
          assignee_id: string | null
          board_id: string
          card_id: string | null
          created_at: string
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["action_item_status"]
          team_id: string
          title: string
        }
        Insert: {
          assignee_id?: string | null
          board_id: string
          card_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["action_item_status"]
          team_id: string
          title: string
        }
        Update: {
          assignee_id?: string | null
          board_id?: string
          card_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["action_item_status"]
          team_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      board_participants: {
        Row: {
          board_id: string
          display_name: string
          id: string
          is_anonymous: boolean | null
          joined_at: string
          session_token: string | null
          user_id: string | null
        }
        Insert: {
          board_id: string
          display_name: string
          id?: string
          is_anonymous?: boolean | null
          joined_at?: string
          session_token?: string | null
          user_id?: string | null
        }
        Update: {
          board_id?: string
          display_name?: string
          id?: string
          is_anonymous?: boolean | null
          joined_at?: string
          session_token?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "board_participants_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      boards: {
        Row: {
          completed_at: string | null
          created_at: string
          facilitator_id: string | null
          id: string
          settings: Json | null
          status: Database["public"]["Enums"]["board_status"]
          team_id: string
          template: Database["public"]["Enums"]["board_template"]
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          facilitator_id?: string | null
          id?: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["board_status"]
          team_id: string
          template?: Database["public"]["Enums"]["board_template"]
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          facilitator_id?: string | null
          id?: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["board_status"]
          team_id?: string
          template?: Database["public"]["Enums"]["board_template"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "boards_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boards_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          author_id: string | null
          board_id: string
          column_id: string
          content: string
          created_at: string
          group_id: string | null
          id: string
          is_anonymous: boolean | null
          sort_order: number
        }
        Insert: {
          author_id?: string | null
          board_id: string
          column_id: string
          content: string
          created_at?: string
          group_id?: string | null
          id?: string
          is_anonymous?: boolean | null
          sort_order?: number
        }
        Update: {
          author_id?: string | null
          board_id?: string
          column_id?: string
          content?: string
          created_at?: string
          group_id?: string | null
          id?: string
          is_anonymous?: boolean | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "cards_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "columns"
            referencedColumns: ["id"]
          },
        ]
      }
      columns: {
        Row: {
          board_id: string
          color: string | null
          icon: string | null
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          board_id: string
          color?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          board_id?: string
          color?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          locale: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          locale?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          locale?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          invite_code: string | null
          name: string
          owner_id: string
          settings: Json | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string | null
          name: string
          owner_id: string
          settings?: Json | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string | null
          name?: string
          owner_id?: string
          settings?: Json | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          board_id: string
          card_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          board_id: string
          card_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          board_id?: string
          card_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
      get_team_role: {
        Args: { p_team_id: string; p_user_id: string }
        Returns: Database["public"]["Enums"]["team_role"]
      }
      has_team_role: {
        Args: {
          p_min_role: Database["public"]["Enums"]["team_role"]
          p_team_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      is_team_member: {
        Args: { p_team_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      action_item_status: "open" | "in_progress" | "done"
      board_status: "draft" | "active" | "voting" | "discussing" | "completed"
      board_template:
        | "mad_sad_glad"
        | "start_stop_continue"
        | "4ls"
        | "kalm"
        | "sailboat"
        | "custom"
      team_role: "owner" | "admin" | "facilitator" | "member"
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
      action_item_status: ["open", "in_progress", "done"],
      board_status: ["draft", "active", "voting", "discussing", "completed"],
      board_template: [
        "mad_sad_glad",
        "start_stop_continue",
        "4ls",
        "kalm",
        "sailboat",
        "custom",
      ],
      team_role: ["owner", "admin", "facilitator", "member"],
    },
  },
} as const
