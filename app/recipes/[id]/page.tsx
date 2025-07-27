'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase, getRecipeWithAuthor, toggleFavorite } from '@/lib/supabase';
import { RECIPE_CATEGORIES, DIFFICULTY_LEVELS } from '@/lib/types';

interface RecipeWithAuthor {
  id: string;
  title: string;
  description: string | null;
  ingredients: string[];
  steps: string[];
  cooking_time: number | null;
  servings: number | null;
  difficulty_level: number | null;
  category: string;
  image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  is_favorited: boolean;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [recipe, setRecipe] = useState<RecipeWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipeWithAuthor(params.id as string);
        setRecipe(data as RecipeWithAuthor);
        setIsFavorited(data.is_favorited || false);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError('Recipe not found');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRecipe();
    }
  }, [params.id]);

  const handleFavorite = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      const newFavoriteState = await toggleFavorite(recipe!.id, user.id);
      setIsFavorited(newFavoriteState);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipe!.id);

      if (error) {
        setError(error.message);
      } else {
        router.push('/recipes');
      }
    } catch (error) {
      setError('An error occurred while deleting the recipe');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading recipe...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-gray-800 mb-4">
              Recipe Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The recipe you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => router.push('/recipes')}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Browse Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAuthor = user && recipe.users.id === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            {recipe.image_url && (
              <div className="w-full h-64 md:h-96 bg-gray-200">
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                      {RECIPE_CATEGORIES[recipe.category as keyof typeof RECIPE_CATEGORIES]}
                    </span>
                    {recipe.difficulty_level && (
                      <span className="text-sm text-gray-500">
                        {'⭐'.repeat(recipe.difficulty_level)}
                      </span>
                    )}
                  </div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    {recipe.title}
                  </h1>
                  {recipe.description && (
                    <p className="text-gray-600 text-lg">
                      {recipe.description}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4 md:mt-0">
                  <button
                    onClick={handleFavorite}
                    disabled={favoriteLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isFavorited
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {favoriteLoading ? '...' : (isFavorited ? '❤️ Favorited' : '🤍 Favorite')}
                  </button>
                  
                  {isAuthor && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recipe Meta */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {recipe.cooking_time && (
                  <div className="text-center">
                    <div className="text-2xl mb-1">⏱️</div>
                    <div className="text-sm text-gray-600">Cooking Time</div>
                    <div className="font-semibold">{recipe.cooking_time} min</div>
                  </div>
                )}
                {recipe.servings && (
                  <div className="text-center">
                    <div className="text-2xl mb-1">👥</div>
                    <div className="text-sm text-gray-600">Servings</div>
                    <div className="font-semibold">{recipe.servings}</div>
                  </div>
                )}
                {recipe.difficulty_level && (
                  <div className="text-center">
                    <div className="text-2xl mb-1">📊</div>
                    <div className="text-sm text-gray-600">Difficulty</div>
                    <div className="font-semibold">
                      {DIFFICULTY_LEVELS[recipe.difficulty_level as keyof typeof DIFFICULTY_LEVELS]}
                    </div>
                  </div>
                )}
                                 <div className="text-center">
                   <div className="text-2xl mb-1">👨‍🍳</div>
                   <div className="text-sm text-gray-600">Author</div>
                   <div className="font-semibold">{recipe.users?.username || 'Unknown User'}</div>
                 </div>
              </div>
            </div>
          </div>

          {/* Ingredients and Instructions */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ingredients */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">
                Ingredients
              </h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-amber-500 rounded-full mt-2"></span>
                    <span className="text-gray-700">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">
                Instructions
              </h2>
              <ol className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/recipes')}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Back to Recipes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 