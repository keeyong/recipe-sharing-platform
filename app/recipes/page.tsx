'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRecipesWithAuthor } from '@/lib/supabase';
import { RecipeCategory, RECIPE_CATEGORIES } from '@/lib/types';

interface RecipeWithAuthor {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cooking_time: number | null;
  servings: number | null;
  difficulty_level: number | null;
  category: RecipeCategory;
  created_at: string;
  users: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'all'>('all');
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeWithAuthor[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getRecipesWithAuthor(50, 0);
        setRecipes(data as RecipeWithAuthor[]);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    let filtered = recipes;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }

    setFilteredRecipes(filtered);
  }, [recipes, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading recipes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">
                Discover Recipes
              </h1>
              <p className="text-gray-600">
                Explore amazing recipes from our community of home cooks
              </p>
            </div>
            <Link
              href="/recipes/create"
              className="mt-4 md:mt-0 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold"
            >
              Share Your Recipe
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as RecipeCategory | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {Object.entries(RECIPE_CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍳</div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">
              {searchQuery || selectedCategory !== 'all' ? 'No recipes found' : 'No recipes yet'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Be the first to share a recipe!'
              }
            </p>
            <Link
              href="/recipes/create"
              className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold"
            >
              Create First Recipe
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
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
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">
                      {RECIPE_CATEGORIES[recipe.category]}
                    </span>
                    {recipe.difficulty_level && (
                      <span className="text-sm text-gray-500">
                        {'⭐'.repeat(recipe.difficulty_level)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>
                  {recipe.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      {recipe.cooking_time && (
                        <span>⏱️ {recipe.cooking_time} min</span>
                      )}
                      {recipe.servings && (
                        <span>👥 {recipe.servings} servings</span>
                      )}
                    </div>
                                         <div className="flex items-center space-x-2">
                       <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                         <span className="text-xs">👨‍🍳</span>
                       </div>
                       <span className="font-medium">{recipe.users?.username || 'Unknown User'}</span>
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 