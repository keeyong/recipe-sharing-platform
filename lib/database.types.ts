export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type RecipeCategory = 
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'dessert'
  | 'snack'
  | 'appetizer'
  | 'soup'
  | 'salad'
  | 'beverage'
  | 'other';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      recipes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          ingredients: Json;
          steps: Json;
          cooking_time: number | null;
          servings: number | null;
          difficulty_level: number | null;
          category: RecipeCategory;
          image_url: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          ingredients?: Json;
          steps?: Json;
          cooking_time?: number | null;
          servings?: number | null;
          difficulty_level?: number | null;
          category?: RecipeCategory;
          image_url?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          ingredients?: Json;
          steps?: Json;
          cooking_time?: number | null;
          servings?: number | null;
          difficulty_level?: number | null;
          category?: RecipeCategory;
          image_url?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipe_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipe_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_recipe_with_author: {
        Args: {
          recipe_uuid: string;
        };
        Returns: {
          id: string;
          title: string;
          description: string | null;
          ingredients: Json;
          steps: Json;
          cooking_time: number | null;
          servings: number | null;
          difficulty_level: number | null;
          category: RecipeCategory;
          image_url: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
          author_id: string;
          author_username: string;
          author_avatar_url: string | null;
          is_favorited: boolean;
        }[];
      };
      get_user_favorites: {
        Args: {
          user_uuid: string;
        };
        Returns: {
          recipe_id: string;
          recipe_title: string;
          recipe_image_url: string | null;
          favorited_at: string;
        }[];
      };
    };
    Enums: {
      recipe_category: RecipeCategory;
    };
  };
} 