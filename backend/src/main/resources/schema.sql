-- Hibernate's update mode does not widen existing varchar columns.
-- A fresh database has no users table yet; Hibernate creates bio as TEXT afterward.
ALTER TABLE IF EXISTS users ALTER COLUMN bio TYPE TEXT;
