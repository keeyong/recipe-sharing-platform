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

export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  cooking_time?: number;
  servings?: number;
  difficulty_level?: number;
  category: RecipeCategory;
  image_url?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeWithAuthor extends Recipe {
  author: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  is_favorited: boolean;
}

export interface Favorite {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

export interface CreateRecipeData {
  title: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  cooking_time?: number;
  servings?: number;
  difficulty_level?: number;
  category: RecipeCategory;
  image_url?: string;
  is_public?: boolean;
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {
  id: string;
}

export interface CreateUserData {
  username: string;
  avatar_url?: string;
  bio?: string;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: string;
}

// Database table names
export const TABLES = {
  USERS: 'users',
  RECIPES: 'recipes',
  FAVORITES: 'favorites',
} as const;

// Recipe difficulty levels
export const DIFFICULTY_LEVELS = {
  1: 'Easy',
  2: 'Easy-Medium',
  3: 'Medium',
  4: 'Medium-Hard',
  5: 'Hard',
} as const;

export type DifficultyLevel = keyof typeof DIFFICULTY_LEVELS;

// Recipe categories with display names
export const RECIPE_CATEGORIES: Record<RecipeCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  dessert: 'Dessert',
  snack: 'Snack',
  appetizer: 'Appetizer',
  soup: 'Soup',
  salad: 'Salad',
  beverage: 'Beverage',
  other: 'Other',
} as const; 