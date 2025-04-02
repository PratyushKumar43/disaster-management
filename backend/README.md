# Backend Database with Supabase

This folder contains all database-related code and operations using Supabase.

## Setup

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from the project settings
4. Add these credentials to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Database Structure

Define your tables in the Supabase dashboard:

1. Go to your project's SQL Editor
2. Create tables with the appropriate schema
3. Set up Row Level Security (RLS) policies

## Usage

The `db.ts` file contains example functions for CRUD operations. Import and use these functions in your components:

```tsx
import { getAllUsers, createUser } from '@/backend/db';

// In your component:
const users = await getAllUsers();
```

## Authentication

For authentication features, use Supabase Auth methods:

```tsx
import supabase from '@/backend/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'example@email.com',
  password: 'example-password',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'example@email.com',
  password: 'example-password',
});

// Sign out
await supabase.auth.signOut();
``` 