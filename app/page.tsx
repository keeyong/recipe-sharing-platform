import Image from "next/image";
import Link from "next/link";
import { AuthButtons } from "@/components/auth-buttons";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🍳</span>
          </div>
          <span className="font-display text-2xl font-bold text-gray-800">ShareMyRecipe</span>
        </div>
                       <div className="hidden md:flex space-x-6">
                 <Link href="/recipes" className="text-gray-600 hover:text-amber-600 transition-colors">
                   Browse Recipes
                 </Link>
                 <Link href="/dashboard" className="text-gray-600 hover:text-amber-600 transition-colors">
                   Dashboard
                 </Link>
                 <Link href="/recipes/create" className="text-gray-600 hover:text-amber-600 transition-colors">
                   Create Recipe
                 </Link>
                 <Link href="/pricing" className="text-gray-600 hover:text-amber-600 transition-colors">
                   Pricing
                 </Link>
                 <Link href="/consulting" className="text-gray-600 hover:text-amber-600 transition-colors">
                   Consulting
                 </Link>
               </div>
        <AuthButtons />
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-display text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Share Your
            <span className="text-amber-500 block">Culinary Magic</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Discover, create, and share amazing recipes with a community of passionate home cooks. 
            From family favorites to gourmet creations, every dish tells a story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="px-8 py-4 bg-amber-500 text-white rounded-lg text-lg font-semibold hover:bg-amber-600 transition-colors shadow-lg hover:shadow-xl"
            >
              Start Sharing Today
            </Link>
            <Link 
              href="/recipes" 
              className="px-8 py-4 border-2 border-amber-500 text-amber-500 rounded-lg text-lg font-semibold hover:bg-amber-500 hover:text-white transition-colors"
            >
              Explore Recipes
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-gray-800 mb-4">
            Why Choose ShareMyRecipe?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to share your culinary passion with the world
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="font-display text-xl font-semibold text-gray-800 mb-3">
              Easy Recipe Creation
            </h3>
            <p className="text-gray-600">
              Upload photos, add ingredients, and write step-by-step instructions with our intuitive recipe builder.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-display text-xl font-semibold text-gray-800 mb-3">
              Smart Search & Discovery
            </h3>
            <p className="text-gray-600">
              Find recipes by ingredients, cooking time, or dietary preferences. Discover new favorites every day.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❤️</span>
            </div>
            <h3 className="font-display text-xl font-semibold text-gray-800 mb-3">
              Save & Organize
            </h3>
            <p className="text-gray-600">
              Like and save your favorite recipes to your personal collection. Never lose a great recipe again.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-amber-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Ready to Share Your First Recipe?
          </h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Join thousands of home cooks who are already sharing their culinary creations
          </p>
          <Link 
            href="/signup" 
            className="inline-block px-8 py-4 bg-white text-amber-500 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
                  <span className="text-white text-sm">🍳</span>
                </div>
                <span className="font-display text-xl font-bold">ShareMyRecipe</span>
              </div>
              <p className="text-gray-300">
                Connecting food lovers through the joy of cooking and sharing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/recipes" className="hover:text-white transition-colors">Browse Recipes</Link></li>
                <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
                <li><Link href="/trending" className="hover:text-white transition-colors">Trending</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/newsletter" className="hover:text-white transition-colors">Newsletter</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 ShareMyRecipe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
