# Supabase Setup Guide for ShareMyRecipe

This guide will help you set up your Supabase project for the ShareMyRecipe application.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `sharemyrecipe` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## 2. Get Environment Variables

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

3. Create a `.env.local` file in your project root and add:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query and paste the entire contents of `supabase-schema.sql`
3. Click "Run" to execute the schema

This will create:
- `users` table (extends auth.users)
- `recipes` table
- `favorites` table
- RLS (Row Level Security) policies
- Triggers and functions

## 4. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, make sure **Email** is enabled
3. Configure email templates if desired (optional)
4. Under **URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` (for development)
   - Add redirect URLs: `http://localhost:3000/auth/callback`

## 5. Set Up Storage for Recipe Images

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Configure the bucket:
   - **Name**: `recipe-images`
   - **Public bucket**: ✅ Check this (so images can be viewed without authentication)
   - **File size limit**: `5MB` (or your preferred limit)
   - **Allowed MIME types**: `image/*`

4. Go to **Storage** → **Policies**
5. Click on the `recipe-images` bucket
6. Add the following policies:

### Policy 1: Allow authenticated users to upload images
```sql
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'recipe-images' AND 
  auth.role() = 'authenticated'
);
```

### Policy 2: Allow users to update their own images
```sql
CREATE POLICY "Allow users to update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'recipe-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 3: Allow users to delete their own images
```sql
CREATE POLICY "Allow users to delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'recipe-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 4: Allow public read access to images
```sql
CREATE POLICY "Allow public read access to images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'recipe-images'
);
```

## 6. Test the Setup

1. Start your development server:
```bash
npm run dev
```

2. Test the following features:
   - User registration and login
   - Creating a recipe with image upload
   - Viewing recipes
   - Adding/removing favorites
   - Editing and deleting recipes

## 7. Production Deployment

When deploying to production:

1. Update your Supabase project settings:
   - Go to **Authentication** → **Settings** → **URL Configuration**
   - Update **Site URL** to your production domain
   - Add your production domain to redirect URLs

2. Update your environment variables in your hosting platform (Vercel, etc.)

3. Consider setting up custom domains for your Supabase project (optional)

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**: Make sure you're using the `anon` key, not the `service_role` key
2. **RLS policy errors**: Ensure all policies are properly configured
3. **Image upload failures**: Check that the storage bucket exists and policies are set up correctly
4. **Authentication redirect issues**: Verify your redirect URLs are correct

### Database Schema Issues:

If you encounter errors when running the schema:

1. Check that the `uuid-ossp` extension is enabled
2. Ensure you have the necessary permissions
3. Try running the schema in smaller chunks if there are specific errors

### Storage Issues:

If image uploads aren't working:

1. Verify the bucket name is exactly `recipe-images`
2. Check that the bucket is public
3. Ensure all storage policies are properly configured
4. Check the browser console for specific error messages

## Security Notes

- The `anon` key is safe to use in client-side code
- RLS policies ensure users can only access their own data
- Storage policies restrict users to their own folders
- Never expose the `service_role` key in client-side code

## Next Steps

After completing this setup:

1. Test all CRUD operations for recipes
2. Test the favorites functionality
3. Test image uploads
4. Consider adding additional features like:
   - Recipe categories
   - Search functionality
   - User profiles
   - Social features

Your ShareMyRecipe application should now be fully functional with Supabase! 