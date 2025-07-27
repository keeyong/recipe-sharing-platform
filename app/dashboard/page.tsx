'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase, getUserFavorites } from '@/lib/supabase';
import { RECIPE_CATEGORIES } from '@/lib/types';

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cooking_time: number | null;
  servings: number | null;
  difficulty_level: number | null;
  category: string;
  is_public: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-recipes' | 'favorites'>('my-recipes');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user's recipes
        const { data: recipesData, error: recipesError } = await supabase
          .from('recipes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (recipesError) {
          console.error('Error fetching recipes:', recipesError);
        } else {
          setMyRecipes(recipesData || []);
        }

        // Fetch user's favorites
        const favoritesData = await getUserFavorites(user.id);
        setFavorites(favoritesData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (error) {
        console.error('Error deleting recipe:', error);
      } else {
        setMyRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">
                Welcome back, {user.email}!
              </h1>
              <p className="text-gray-600">
                Manage your recipes and discover new favorites
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => router.push('/recipes/create')}
                className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold"
              >
                Create New Recipe
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-amber-600 mb-2">
              {myRecipes.length}
            </div>
            <div className="text-gray-600">My Recipes</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-red-500 mb-2">
              {favorites.length}
            </div>
            <div className="text-gray-600">Favorites</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {myRecipes.filter(r => r.is_public).length}
            </div>
            <div className="text-gray-600">Public Recipes</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('my-recipes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-recipes'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Recipes ({myRecipes.length})
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'favorites'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Favorites ({favorites.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'my-recipes' ? (
              <div>
                {myRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🍳</div>
                    <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">
                      No recipes yet
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Start sharing your culinary creations with the community!
                    </p>
                    <button
                      onClick={() => router.push('/recipes/create')}
                      className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold"
                    >
                      Create Your First Recipe
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myRecipes.map((recipe) => (
                      <div key={recipe.id} className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                          {recipe.image_url ? (
                            <img
                              src={recipe.image_url}
                              alt={recipe.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                              <span className="text-4xl text-gray-400">🍽️</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">
                              {RECIPE_CATEGORIES[recipe.category as keyof typeof RECIPE_CATEGORIES]}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              recipe.is_public 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {recipe.is_public ? 'Public' : 'Private'}
                            </span>
                          </div>
                          <h3 className="font-display text-lg font-semibold text-gray-800 mb-2">
                            {recipe.title}
                          </h3>
                          {recipe.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {recipe.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                            <div className="flex items-center space-x-4">
                              {recipe.cooking_time && (
                                <span>⏱️ {recipe.cooking_time} min</span>
                              )}
                              {recipe.servings && (
                                <span>👥 {recipe.servings} servings</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/recipes/${recipe.id}`)}
                              className="flex-1 px-3 py-2 bg-amber-500 text-white text-sm rounded hover:bg-amber-600 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
                              className="px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRecipe(recipe.id)}
                              className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">❤️</div>
                    <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">
                      No favorites yet
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Start exploring recipes and add them to your favorites!
                    </p>
                    <button
                      onClick={() => router.push('/recipes')}
                      className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold"
                    >
                      Browse Recipes
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((recipe) => (
                      <div key={recipe.id} className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                          {recipe.image_url ? (
                            <img
                              src={recipe.image_url}
                              alt={recipe.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                              <span className="text-4xl text-gray-400">🍽️</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">
                              {RECIPE_CATEGORIES[recipe.category as keyof typeof RECIPE_CATEGORIES]}
                            </span>
                            <span className="text-red-500">❤️</span>
                          </div>
                          <h3 className="font-display text-lg font-semibold text-gray-800 mb-2">
                            {recipe.title}
                          </h3>
                          {recipe.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {recipe.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                            <div className="flex items-center space-x-4">
                              {recipe.cooking_time && (
                                <span>⏱️ {recipe.cooking_time} min</span>
                              )}
                              {recipe.servings && (
                                <span>👥 {recipe.servings} servings</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => router.push(`/recipes/${recipe.id}`)}
                            className="w-full px-3 py-2 bg-amber-500 text-white text-sm rounded hover:bg-amber-600 transition-colors"
                          >
                            View Recipe
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 