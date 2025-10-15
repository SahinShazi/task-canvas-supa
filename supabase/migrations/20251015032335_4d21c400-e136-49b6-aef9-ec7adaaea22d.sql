-- Drop the unused 'To-do' table to reduce attack surface
-- This table has RLS enabled but no policies, exposing database structure
DROP TABLE IF EXISTS public."To-do" CASCADE;