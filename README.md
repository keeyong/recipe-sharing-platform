# ShareMyRecipe 🍳

A modern recipe sharing platform built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

- **🔐 User Authentication** - Email/password signup and login
- **📝 Recipe Management** - Create, read, update, and delete recipes
- **🖼️ Image Upload** - Upload recipe images to Supabase Storage
- **❤️ Favorites System** - Save and manage favorite recipes
- **🔍 Search & Filter** - Search recipes and filter by category
- **📱 Responsive Design** - Mobile-friendly interface
- **🛡️ Security** - Row Level Security (RLS) policies
- **⚡ Real-time** - Live updates with Supabase

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sharemyrecipe.git
   cd sharemyrecipe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Follow the [Supabase Setup Guide](./SUPABASE_SETUP.md)
   - Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
sharemyrecipe/
├── app/                    # Next.js App Router
│   ├── dashboard/         # User dashboard
│   ├── login/            # Login page
│   ├── recipes/          # Recipe pages
│   ├── signup/           # Signup page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable components
│   └── auth-buttons.tsx  # Authentication buttons
├── lib/                   # Utility functions
│   ├── auth-context.tsx  # Authentication context
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # TypeScript types
│   └── database.types.ts # Database types
├── supabase-schema.sql   # Database schema
└── SUPABASE_SETUP.md     # Supabase setup guide
```

## 🗄️ Database Schema

The application uses the following main tables:

- **`users`** - User profiles (extends Supabase auth)
- **`recipes`** - Recipe data with ingredients and steps
- **`favorites`** - User favorite recipes

See [supabase-schema.sql](./supabase-schema.sql) for the complete schema.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql`
3. Configure authentication settings
4. Set up storage bucket for recipe images
5. Configure RLS policies

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend-as-a-service
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vercel](https://vercel.com/) for the deployment platform

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ by [Your Name]
