-- ShareMyRecipe Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE recipe_category AS ENUM (
  'breakfast',
  'lunch',
  'dinner',
  'dessert',
  'snack',
  'appetizer',
  'soup',
  'salad',
  'beverage',
  'other'
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps JSONB NOT NULL DEFAULT '[]',
  cooking_time INTEGER, -- in minutes
  servings INTEGER,
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  category recipe_category DEFAULT 'other',
  image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Create indexes for better performance
CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX idx_recipes_category ON public.recipes(category);
CREATE INDEX idx_recipes_created_at ON public.recipes(created_at DESC);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_recipe_id ON public.favorites(recipe_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Anyone can view public recipes" ON public.recipes
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON public.recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON public.recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to get user's favorite recipes
CREATE OR REPLACE FUNCTION get_user_favorites(user_uuid UUID)
RETURNS TABLE (
  recipe_id UUID,
  recipe_title TEXT,
  recipe_image_url TEXT,
  favorited_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.image_url,
    f.created_at
  FROM public.favorites f
  JOIN public.recipes r ON f.recipe_id = r.id
  WHERE f.user_id = user_uuid
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get recipe with author info
CREATE OR REPLACE FUNCTION get_recipe_with_author(recipe_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  ingredients JSONB,
  steps JSONB,
  cooking_time INTEGER,
  servings INTEGER,
  difficulty_level INTEGER,
  category recipe_category,
  image_url TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  author_id UUID,
  author_username TEXT,
  author_avatar_url TEXT,
  is_favorited BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.ingredients,
    r.steps,
    r.cooking_time,
    r.servings,
    r.difficulty_level,
    r.category,
    r.image_url,
    r.is_public,
    r.created_at,
    r.updated_at,
    u.id as author_id,
    u.username as author_username,
    u.avatar_url as author_avatar_url,
    CASE WHEN f.id IS NOT NULL THEN true ELSE false END as is_favorited
  FROM public.recipes r
  JOIN public.users u ON r.user_id = u.id
  LEFT JOIN public.favorites f ON f.recipe_id = r.id AND f.user_id = auth.uid()
  WHERE r.id = recipe_uuid AND (r.is_public = true OR r.user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample categories for testing
INSERT INTO public.recipes (user_id, title, description, ingredients, steps, cooking_time, servings, difficulty_level, category, is_public)
VALUES 
  (
    (SELECT id FROM auth.users LIMIT 1),
    'Sample Pasta Carbonara',
    'A classic Italian pasta dish with eggs, cheese, and pancetta',
    '["400g spaghetti", "200g pancetta", "4 large eggs", "100g pecorino cheese", "Black pepper", "Salt"]',
    '["Bring a large pot of salted water to boil", "Cook spaghetti according to package directions", "Meanwhile, cook pancetta until crispy", "Beat eggs with cheese and pepper", "Combine hot pasta with egg mixture and pancetta"]',
    20,
    4,
    2,
    'dinner',
    true
  )
ON CONFLICT DO NOTHING; 