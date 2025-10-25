/*
  # Create Posts and Spider Chains Schema

  ## Overview
  This migration creates the data structure for user posts (images/videos) and spider chain relationships.

  ## 1. New Tables
  
  ### `posts`
  - `id` (uuid, primary key) - Unique identifier for each post
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `title` (text) - Post title
  - `description` (text, nullable) - Post description
  - `parent_post_id` (uuid, nullable) - Reference to parent post for spider chains
  - `likes_count` (integer) - Number of likes (default 0)
  - `dislikes_count` (integer) - Number of dislikes (default 0)
  - `spider_chains_count` (integer) - Number of child posts (default 0)
  - `views_count` (integer) - Number of views (default 0)
  - `created_at` (timestamptz) - Post creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `post_media`
  - `id` (uuid, primary key) - Unique identifier for media
  - `post_id` (uuid, foreign key) - Reference to posts table
  - `media_url` (text) - URL to the media file
  - `media_type` (text) - Type: 'image' or 'video'
  - `order_index` (integer) - Order in carousel (default 0)
  - `created_at` (timestamptz) - Media creation timestamp

  ### `post_reactions`
  - `id` (uuid, primary key) - Unique identifier
  - `post_id` (uuid, foreign key) - Reference to posts table
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `reaction_type` (text) - Type: 'like' or 'dislike'
  - `created_at` (timestamptz) - Reaction timestamp
  - Unique constraint on (post_id, user_id)

  ## 2. Indexes
  - Index on posts.user_id for efficient user profile queries
  - Index on posts.parent_post_id for spider chain traversal
  - Index on post_media.post_id for media lookups
  - Index on post_reactions (post_id, user_id) for reaction queries

  ## 3. Security
  - Enable RLS on all tables
  - Users can view all posts
  - Users can only create/update/delete their own posts
  - Users can create reactions on any post
  - Users can only delete their own reactions
*/

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  parent_post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  likes_count integer DEFAULT 0,
  dislikes_count integer DEFAULT 0,
  spider_chains_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create post_media table
CREATE TABLE IF NOT EXISTS post_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create post_reactions table
CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_parent_post_id ON posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON post_media(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_user ON post_reactions(post_id, user_id);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Post media policies
CREATE POLICY "Anyone can view post media"
  ON post_media FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create media for own posts"
  ON post_media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_media.post_id
      AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete media for own posts"
  ON post_media FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_media.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Post reactions policies
CREATE POLICY "Anyone can view reactions"
  ON post_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reactions"
  ON post_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON post_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update spider_chains_count
CREATE OR REPLACE FUNCTION update_spider_chains_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_post_id IS NOT NULL THEN
    UPDATE posts
    SET spider_chains_count = spider_chains_count + 1
    WHERE id = NEW.parent_post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_post_id IS NOT NULL THEN
    UPDATE posts
    SET spider_chains_count = spider_chains_count - 1
    WHERE id = OLD.parent_post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for spider_chains_count
CREATE TRIGGER trigger_update_spider_chains_count
AFTER INSERT OR DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_spider_chains_count();

-- Function to update reaction counts
CREATE OR REPLACE FUNCTION update_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'like' THEN
      UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.reaction_type = 'dislike' THEN
      UPDATE posts SET dislikes_count = dislikes_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'like' THEN
      UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    ELSIF OLD.reaction_type = 'dislike' THEN
      UPDATE posts SET dislikes_count = dislikes_count - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reaction counts
CREATE TRIGGER trigger_update_reaction_counts
AFTER INSERT OR DELETE ON post_reactions
FOR EACH ROW
EXECUTE FUNCTION update_reaction_counts();
