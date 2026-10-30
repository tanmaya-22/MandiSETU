-- MandiSetu PostgreSQL Database Setup Script
-- Run this in pgAdmin or psql to initialize the MandiSetu database

-- 1. Create database user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mandisetu') THEN
      CREATE USER mandisetu WITH ENCRYPTED PASSWORD 'mandisetu';
   END IF;
END
$do$;

-- 2. Grant superuser / create db privileges
ALTER USER mandisetu CREATEDB;

-- 3. Create database owned by mandisetu
SELECT 'CREATE DATABASE mandisetu_db OWNER mandisetu'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mandisetu_db')\gexec

-- 4. Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE mandisetu_db TO mandisetu;
