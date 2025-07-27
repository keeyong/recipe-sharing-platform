import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Helper function to get recipes with author info
export const getRecipesWithAuthor = async (limit = 10, offset = 0) => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      users (
        id,
        username,
        avatar_url
      )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
};

// Helper function to get a single recipe with author info
export const getRecipeWithAuthor = async (recipeId: string) => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      users (
        id,
        username,
        avatar_url
      )
    `)
    .eq('id', recipeId)
    .single();

  if (error) throw error;
  return data;
};

// Helper function to check if a recipe is favorited by current user
export const isRecipeFavorited = async (recipeId: string, userId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return !!data;
};

// Helper function to toggle favorite
export const toggleFavorite = async (recipeId: string, userId: string) => {
  const isFavorited = await isRecipeFavorited(recipeId, userId);
  
  if (isFavorited) {
    // Remove from favorites
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('recipe_id', recipeId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return false;
  } else {
    // Add to favorites
    const { error } = await supabase
      .from('favorites')
      .insert({
        recipe_id: recipeId,
        user_id: userId,
      });
    
    if (error) throw error;
    return true;
  }
};

// Helper function to get user's favorite recipes
export const getUserFavorites = async (userId: string, limit = 10, offset = 0) => {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      recipes (
        *,
        users (
          id,
          username,
          avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
};

// Helper function to search recipes
export const searchRecipes = async (query: string, limit = 10, offset = 0) => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      users!recipes_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .eq('is_public', true)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
};

// Helper function to get recipes by category
export const getRecipesByCategory = async (category: string, limit = 10, offset = 0) => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      users!recipes_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .eq('is_public', true)
    .eq('category', category)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}; 