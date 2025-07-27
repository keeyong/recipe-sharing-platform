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

// 구독 관련 헬퍼 함수들
export async function getSubscriptionPlans() {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      subscription_plans (*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getUserUsage(userId: string, monthYear: string) {
  const { data, error } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('month_year', monthYear)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || {
    recipes_uploaded: 0,
    images_uploaded: 0,
    total_image_size: 0,
  };
}

export async function incrementRecipeUsage(userId: string, monthYear: string) {
  const { data: existingUsage } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('month_year', monthYear)
    .single();

  if (existingUsage) {
    const { error } = await supabase
      .from('user_usage')
      .update({
        recipes_uploaded: existingUsage.recipes_uploaded + 1,
      })
      .eq('id', existingUsage.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('user_usage')
      .insert({
        user_id: userId,
        month_year: monthYear,
        recipes_uploaded: 1,
      });

    if (error) throw error;
  }
}

export async function incrementImageUsage(userId: string, monthYear: string, imageSize: number) {
  const { data: existingUsage } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('month_year', monthYear)
    .single();

  if (existingUsage) {
    const { error } = await supabase
      .from('user_usage')
      .update({
        images_uploaded: existingUsage.images_uploaded + 1,
        total_image_size: existingUsage.total_image_size + imageSize,
      })
      .eq('id', existingUsage.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('user_usage')
      .insert({
        user_id: userId,
        month_year: monthYear,
        images_uploaded: 1,
        total_image_size: imageSize,
      });

    if (error) throw error;
  }
}

export async function createSubscriptionRecord(
  userId: string,
  planId: string,
  stripeSubscriptionId: string,
  stripeCustomerId: string
) {
  const { error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      plan_id: planId,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_customer_id: stripeCustomerId,
      status: 'active',
    });

  if (error) throw error;
}

export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  status: string,
  currentPeriodEnd?: string
) {
  const updateData: any = { status };
  if (currentPeriodEnd) {
    updateData.current_period_end = currentPeriodEnd;
  }

  const { error } = await supabase
    .from('user_subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', stripeSubscriptionId);

  if (error) throw error;
}

export async function createPaymentRecord(
  userId: string,
  subscriptionId: string | null,
  stripePaymentIntentId: string | null,
  stripeInvoiceId: string | null,
  amount: number,
  status: string,
  paymentMethod?: string
) {
  const { error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      subscription_id: subscriptionId,
      stripe_payment_intent_id: stripePaymentIntentId,
      stripe_invoice_id: stripeInvoiceId,
      amount,
      status,
      payment_method: paymentMethod,
    });

  if (error) throw error;
} 