export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      models: {
        Row: {
          base_model: string;
          class: string;
          created_at: string;
          destination_model: string;
          id: string;
          input: Json;
          name: string;
          replicate_training_id: string;
          status: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          base_model: string;
          class: string;
          created_at?: string;
          destination_model: string;
          id: string;
          input: Json;
          name: string;
          replicate_training_id: string;
          status?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          base_model?: string;
          class?: string;
          created_at?: string;
          destination_model?: string;
          id?: string;
          input?: Json;
          name?: string;
          replicate_training_id?: string;
          status?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      photos: {
        Row: {
          created_at: string;
          id: string;
          placeholder_data: string | null;
          predictions_id: string;
          url: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          placeholder_data?: string | null;
          predictions_id: string;
          url?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          placeholder_data?: string | null;
          predictions_id?: string;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "photos_predictions_fk";
            columns: ["predictions_id"];
            isOneToOne: false;
            referencedRelation: "predictions";
            referencedColumns: ["id"];
          },
        ];
      };
      photos_old: {
        Row: {
          created_at: string;
          id: string;
          input: Json;
          model_id: string;
          replicate_id: string;
          status: string;
          updated_at: string | null;
          url: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          input: Json;
          model_id: string;
          replicate_id: string;
          status?: string;
          updated_at?: string | null;
          url?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          input?: Json;
          model_id?: string;
          replicate_id?: string;
          status?: string;
          updated_at?: string | null;
          url?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_models_fk";
            columns: ["model_id"];
            isOneToOne: false;
            referencedRelation: "models";
            referencedColumns: ["id"];
          },
        ];
      };
      predictions: {
        Row: {
          created_at: string;
          id: string;
          input: Json;
          model_id: string;
          replicate_id: string;
          status: string;
          updated_at: string | null;
          url: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          input: Json;
          model_id: string;
          replicate_id: string;
          status?: string;
          updated_at?: string | null;
          url?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          input?: Json;
          model_id?: string;
          replicate_id?: string;
          status?: string;
          updated_at?: string | null;
          url?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "predictions_models_fk";
            columns: ["model_id"];
            isOneToOne: false;
            referencedRelation: "models";
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;
