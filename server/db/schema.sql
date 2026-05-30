-- ============================================================
-- Pune Anime Community (PAC) — MySQL schema
-- Run: mysql -u <user> -p < db/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS pac
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pac;

-- ---- Content tables ----

CREATE TABLE IF NOT EXISTS events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  title       VARCHAR(180) NOT NULL,
  category    VARCHAR(60)  NOT NULL,
  start_at    DATETIME     NOT NULL,
  venue       VARCHAR(200) NOT NULL,
  map_url     VARCHAR(500),
  image       VARCHAR(500),
  excerpt     TEXT,
  price       VARCHAR(60),
  attendance  INT,
  is_past     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS creators (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  name        VARCHAR(120) NOT NULL,
  kind        ENUM('creator','cosplayer') NOT NULL DEFAULT 'creator',
  specialty   VARCHAR(80),
  level       VARCHAR(40),
  commissions VARCHAR(20),
  avatar      VARCHAR(500),
  cover       VARCHAR(500),
  bio         TEXT,
  socials     JSON,
  featured    TINYINT(1)   NOT NULL DEFAULT 0,
  status      ENUM('pending','approved') NOT NULL DEFAULT 'approved',
  submitted_by INT,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(150) NOT NULL UNIQUE,
  title       VARCHAR(200) NOT NULL,
  category    VARCHAR(60),
  author      VARCHAR(120),
  published_at DATE,
  image       VARCHAR(500),
  excerpt     TEXT,
  body        MEDIUMTEXT,
  status      ENUM('pending','approved') NOT NULL DEFAULT 'approved',
  submitted_by INT,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  category    VARCHAR(60),
  src         VARCHAR(500) NOT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  name        VARCHAR(160) NOT NULL,
  category    VARCHAR(60),
  price       VARCHAR(40),
  image       VARCHAR(500),
  tag         VARCHAR(40),
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  role        VARCHAR(80),
  avatar      VARCHAR(500),
  quote       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stats (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  label       VARCHAR(120) NOT NULL,
  value       VARCHAR(40)  NOT NULL,
  sort_order  INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS team_members (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  role        VARCHAR(120),
  team_group  VARCHAR(80),
  avatar      VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS partners (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL
);

-- ---- Form submission tables ----

CREATE TABLE IF NOT EXISTS contact_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  type        VARCHAR(30)  NOT NULL DEFAULT 'general', -- general | partner | volunteer
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(180) NOT NULL,
  subject     VARCHAR(200),
  org         VARCHAR(160),
  area        VARCHAR(120),
  message     TEXT NOT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_signups (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120),
  email       VARCHAR(180) NOT NULL UNIQUE,
  interests   VARCHAR(255),
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ---- Users (Phase 3: admin/auth) ----

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255),                -- null for Google-only accounts
  google_id     VARCHAR(64) UNIQUE,
  phone         VARCHAR(30),
  avatar        VARCHAR(500),
  role          ENUM('member','creator','admin') NOT NULL DEFAULT 'member',
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- RSVPs: one row per (user, event). Real attendance, replaces the fake count.
CREATE TABLE IF NOT EXISTS rsvps (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  event_id    INT NOT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_event (user_id, event_id)
);

-- ---- Idempotent upgrades for existing databases ----
-- Re-running this file adds any columns introduced after the initial schema.
ALTER TABLE events      ADD COLUMN IF NOT EXISTS map_url VARCHAR(500) AFTER venue;
ALTER TABLE creators    ADD COLUMN IF NOT EXISTS status ENUM('pending','approved') NOT NULL DEFAULT 'approved';
ALTER TABLE creators    ADD COLUMN IF NOT EXISTS submitted_by INT;
ALTER TABLE blog_posts  ADD COLUMN IF NOT EXISTS status ENUM('pending','approved') NOT NULL DEFAULT 'approved';
ALTER TABLE blog_posts  ADD COLUMN IF NOT EXISTS submitted_by INT;
ALTER TABLE users       ADD COLUMN IF NOT EXISTS google_id VARCHAR(64) UNIQUE;
ALTER TABLE users       ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE users       ADD COLUMN IF NOT EXISTS avatar VARCHAR(500);
ALTER TABLE users       MODIFY COLUMN password_hash VARCHAR(255) NULL;
