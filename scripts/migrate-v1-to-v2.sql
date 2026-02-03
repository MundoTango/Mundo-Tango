-- Migration Script: V1 to V2 Database
-- Source: ep-silent-poetry (V1 Production - 88 real users)
-- Target: ep-round-sun (V2 Mundo-Tango-V2)

-- This script exports real users from V1 (non-discovered accounts)
-- Run export on V1, then import on V2

-- Step 1: Export users from V1 (run on V1 database)
-- COPY (SELECT * FROM users WHERE email NOT LIKE '%discovered%') TO '/tmp/v1_users.csv' WITH CSV HEADER;

-- Step 2: Get the list of real users to migrate
SELECT id, email, username, name, role, password, 
       is_verified, is_active, suspended, waitlist,
       city, country, bio, avatar_url,
       two_factor_enabled, tango_roles, dance_style,
       created_at, updated_at, last_login_at
FROM users 
WHERE email NOT LIKE '%discovered%'
ORDER BY id;
