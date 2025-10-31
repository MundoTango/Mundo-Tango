-- ═══════════════════════════════════════════════════════════════
-- MUNDO TANGO - FEED WORKSTREAM SEED DATA
-- Realistic Tango-Themed Sample Data for Posts, Likes, and Comments
-- ═══════════════════════════════════════════════════════════════
-- 
-- This script creates realistic seed data for the Feed workstream including:
-- - 30 sample posts with varied tango-themed content
-- - Multiple likes from different users
-- - Comments with engaging tango community discussions
-- 
-- Note: This assumes test users exist in auth.users and profiles tables
-- You may need to create test users first via Supabase Auth
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- CREATE TEST USERS (if they don't exist)
-- ═══════════════════════════════════════════════════════════════
-- Note: In production, users are created via Supabase Auth signup
-- This is a simplified version for testing purposes

-- First, let's create some test profiles
-- These would normally be created automatically via auth.users trigger

DO $$
DECLARE
  user1_id UUID := gen_random_uuid();
  user2_id UUID := gen_random_uuid();
  user3_id UUID := gen_random_uuid();
  user4_id UUID := gen_random_uuid();
  user5_id UUID := gen_random_uuid();
  user6_id UUID := gen_random_uuid();
  user7_id UUID := gen_random_uuid();
  user8_id UUID := gen_random_uuid();
BEGIN
  -- Store UUIDs as temporary variables for this session
  -- These will be used to create posts, likes, and comments
  
  -- Note: In real scenario, these users would come from auth.users
  -- For seed data, we'll use UUIDs that should already exist in profiles table
  -- Or you can manually insert test profiles here
  
  RAISE NOTICE 'Seed data will use existing profile UUIDs from database';
END $$;

-- ═══════════════════════════════════════════════════════════════
-- HELPER: Get random profile IDs for seed data
-- ═══════════════════════════════════════════════════════════════
-- We'll select from existing profiles. If no profiles exist, 
-- you'll need to create some users via Supabase Auth first.

-- ═══════════════════════════════════════════════════════════════
-- SEED POSTS (30 posts with varied tango content)
-- ═══════════════════════════════════════════════════════════════

-- Insert sample posts using existing profile IDs
-- Note: Replace with actual UUIDs from your profiles table, or use subqueries

INSERT INTO public.posts (user_id, content, visibility, image_url, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Just had the most incredible milonga at Salon Canning! 🎵 The orchestra was perfect and I danced for 4 hours straight. This is what tango is all about!',
  'public',
  NULL,
  NOW() - INTERVAL '2 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'New video tutorial series starting next week: "Mastering the Ocho". Whether you''re a beginner or advanced dancer, there''s always something new to learn. Who''s interested?',
  'public',
  NOW() - INTERVAL '4 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Looking for a dance partner for the upcoming festival in Buenos Aires. I''ll be there for 2 weeks in March. DM me if interested!',
  'public',
  NOW() - INTERVAL '6 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Tonight''s practica was amazing! We worked on musicality and connection. Reminder: tango is not about the steps, it''s about the feeling between partners.',
  'public',
  NOW() - INTERVAL '8 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Can someone recommend good tango shoes for wide feet? I''ve tried several brands but nothing feels quite right for long milongas.',
  'public',
  NOW() - INTERVAL '10 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Just discovered Pugliese''s "La Yumba" and I''m obsessed! The dramatic pauses are perfect for those suspended moments in the dance. What''s your favorite Pugliese track?',
  'public',
  NOW() - INTERVAL '12 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Hosting a tango house party this Saturday! Bring your dancing shoes and your favorite bottle. Address in bio. Limited space, RSVP required.',
  'public',
  NOW() - INTERVAL '14 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'The connection I felt on the dance floor tonight... there are no words. This is why I love tango. It''s pure communication without speaking.',
  'public',
  NOW() - INTERVAL '16 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Beginner tip: Focus on your walk before learning complex figures. A beautiful walk is the foundation of tango. Everything else builds on this.',
  'public',
  NOW() - INTERVAL '18 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Just booked my tickets for the Tango World Championship! Who else is going? Would love to meet up with fellow tangueros!',
  'public',
  NOW() - INTERVAL '20 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Practicing my sacadas in the studio. Still not quite there but getting closer! Patience and practice, that''s the tango way.',
  'public',
  NOW() - INTERVAL '22 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Question for the community: How do you deal with crowded milongas? I find it challenging to navigate and express myself when the floor is packed.',
  'public',
  NOW() - INTERVAL '1 day'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Celebrating 5 years of dancing tango today! From struggling with the basic step to dancing milongas across the world. Grateful for this beautiful journey.',
  'public',
  NOW() - INTERVAL '1 day 2 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'The embrace is everything. When you find that perfect connection, time stops and the music just flows through both of you.',
  'public',
  NOW() - INTERVAL '1 day 4 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Looking for recommendations: best milongas in Berlin? I''ll be visiting next month and want to experience the local tango scene.',
  'public',
  NOW() - INTERVAL '1 day 6 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Just finished teaching my first tango class! So nervous but the students were wonderful. There''s nothing like sharing this passion with others.',
  'public',
  NOW() - INTERVAL '1 day 8 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Vals night at La Viruta was magical! There''s something special about dancing vals - it''s like floating on air.',
  'public',
  NOW() - INTERVAL '1 day 10 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Tango wisdom: The follower is not following steps, they''re following the leader''s intention. Lead with your heart, not just your body.',
  'public',
  NOW() - INTERVAL '1 day 12 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Found an amazing new milonga downtown! Great DJ, perfect floor, and the community is so welcoming. This is going to be my new regular spot.',
  'public',
  NOW() - INTERVAL '1 day 14 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Struggling with my boleos today. Any tips from experienced dancers? I feel like I''m forcing it instead of letting it happen naturally.',
  'public',
  NOW() - INTERVAL '1 day 16 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'The milonga tonight was bittersweet - my dance partner is moving to another city. But tango always brings people together, no matter the distance.',
  'public',
  NOW() - INTERVAL '2 days'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'New tango playlist dropping tomorrow on Spotify! All my favorite tandas for practicing at home. Stay tuned!',
  'public',
  NOW() - INTERVAL '2 days 2 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Watching old videos of the maestros and I''m still in awe. The elegance, the musicality, the connection - they make it look so effortless.',
  'public',
  NOW() - INTERVAL '2 days 4 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Private tango practice session today - just me, the music, and the mirror. Sometimes you need to dance alone to truly understand the music.',
  'friends',
  NOW() - INTERVAL '2 days 6 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'The cabeceo is an art form! Took me months to master the subtle eye contact and nod. Now it''s second nature. Respect the codes!',
  'public',
  NOW() - INTERVAL '2 days 8 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Workshop with Pablo and Noelia this weekend! So excited to learn from the masters. Their technique and passion are unmatched.',
  'public',
  NOW() - INTERVAL '2 days 10 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Tango has taught me so much beyond dance - patience, connection, listening, improvisation. It''s a life philosophy.',
  'public',
  NOW() - INTERVAL '2 days 12 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Late night practice session. The studio is quiet, just me and D''Arienzo playing. These are my favorite moments.',
  'private',
  NOW() - INTERVAL '2 days 14 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'Building my tango music library - what are your essential tandas? I want a mix of classic and nuevo.',
  'public',
  NOW() - INTERVAL '2 days 16 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

INSERT INTO public.posts (user_id, content, visibility, created_at) 
SELECT 
  (SELECT id FROM public.profiles ORDER BY RANDOM() LIMIT 1),
  'First time dancing in Buenos Aires! This city breathes tango. Every corner, every cafe, every street. I''m home.',
  'public',
  NOW() - INTERVAL '3 days'
WHERE EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

-- ═══════════════════════════════════════════════════════════════
-- SEED LIKES
-- ═══════════════════════════════════════════════════════════════

-- Add likes to posts from random users
-- Each post gets 2-8 random likes

DO $$
DECLARE
  post_record RECORD;
  random_user_id UUID;
  like_count INTEGER;
  i INTEGER;
BEGIN
  FOR post_record IN SELECT id FROM public.posts LOOP
    like_count := floor(random() * 7 + 2)::INTEGER; -- 2 to 8 likes
    
    FOR i IN 1..like_count LOOP
      SELECT id INTO random_user_id FROM public.profiles ORDER BY RANDOM() LIMIT 1;
      
      -- Insert like, ignore if duplicate (user already liked this post)
      INSERT INTO public.likes (user_id, post_id)
      VALUES (random_user_id, post_record.id)
      ON CONFLICT (user_id, post_id) DO NOTHING;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Likes seeded successfully';
END $$;

-- ═══════════════════════════════════════════════════════════════
-- SEED COMMENTS
-- ═══════════════════════════════════════════════════════════════

-- Add realistic comments to posts
-- Comments feature engaging tango community discussions

-- Sample comments array
DO $$
DECLARE
  post_record RECORD;
  random_user_id UUID;
  comment_count INTEGER;
  comments TEXT[] := ARRAY[
    'Absolutely beautiful! This captures the essence of tango perfectly.',
    'I was there too! What an amazing night.',
    'This is so inspiring. Can''t wait for the next milonga!',
    'Your technique is impeccable. How long have you been dancing?',
    'Love this! Tango is truly a universal language.',
    'Thanks for sharing! This made my day.',
    'I felt the same way at my first milonga in BA. Pure magic.',
    'Great advice for beginners. Wish I knew this when I started!',
    'The musicality in this video is outstanding.',
    'Count me in! Would love to join.',
    'This is exactly what I needed to hear today.',
    'Your posts always remind me why I fell in love with tango.',
    'Beautiful embrace! You can see the connection.',
    'I struggle with this too. Practice makes perfect!',
    'The energy in that room must have been incredible.',
    'Tango is not just a dance, it''s a feeling.',
    'This community is the best! So supportive.',
    'Saving this for later. Great tips!',
    'Your passion is contagious!',
    'Can''t wait to see you on the dance floor!',
    'This is poetry in motion.',
    'The way you describe the connection... perfect.',
    'I need to attend more practicas. Thanks for the motivation!',
    'Your journey is inspiring. Keep dancing!',
    'I remember my first tango class. What a beautiful journey it''s been.'
  ];
  random_comment TEXT;
BEGIN
  -- Add 1-5 comments to each public post
  FOR post_record IN SELECT id FROM public.posts WHERE visibility = 'public' LOOP
    comment_count := floor(random() * 5 + 1)::INTEGER; -- 1 to 5 comments
    
    FOR i IN 1..comment_count LOOP
      SELECT id INTO random_user_id FROM public.profiles ORDER BY RANDOM() LIMIT 1;
      random_comment := comments[floor(random() * array_length(comments, 1) + 1)];
      
      INSERT INTO public.comments (user_id, post_id, content, created_at)
      VALUES (
        random_user_id,
        post_record.id,
        random_comment,
        NOW() - (random() * INTERVAL '2 days')
      );
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Comments seeded successfully';
END $$;

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA COMPLETE ✅
-- ═══════════════════════════════════════════════════════════════
-- Summary:
-- - 30 tango-themed posts created
-- - 2-8 likes per post from random users  
-- - 1-5 comments per public post with engaging discussions
-- - Realistic timestamps spanning 3 days
-- - Mix of public, friends, and private visibility
-- ═══════════════════════════════════════════════════════════════

SELECT 
  (SELECT COUNT(*) FROM public.posts) as total_posts,
  (SELECT COUNT(*) FROM public.likes) as total_likes,
  (SELECT COUNT(*) FROM public.comments) as total_comments;
