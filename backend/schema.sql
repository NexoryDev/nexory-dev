-- Nexory Database Schema
-- Run this once to set up all required tables.
-- MySQL / MariaDB compatible.

CREATE DATABASE IF NOT EXISTS nexory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexory;

CREATE TABLE IF NOT EXISTS users (
    id           VARCHAR(36)  NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    username     VARCHAR(100) DEFAULT NULL,
    avatar       VARCHAR(500) DEFAULT NULL,
    role         VARCHAR(50)  DEFAULT 'user',
    badges       JSON         DEFAULT NULL,
    achievements JSON         DEFAULT NULL,
    friends      JSON         DEFAULT NULL,
    privacy      JSON         DEFAULT NULL,
    verified     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS email_verifications (
    id         INT          NOT NULL AUTO_INCREMENT,
    user_id    VARCHAR(36)  NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME     NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          VARCHAR(36)  NOT NULL,
    user_id     VARCHAR(36)  NOT NULL,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    family_id   VARCHAR(36)  DEFAULT NULL,
    device_id   VARCHAR(255) DEFAULT NULL,
    ip_address  VARCHAR(45)  DEFAULT NULL,
    user_agent  TEXT         DEFAULT NULL,
    expires_at  DATETIME     NOT NULL,
    revoked     TINYINT(1)   NOT NULL DEFAULT 0,
    remember_me TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_resets (
    id         INT          NOT NULL AUTO_INCREMENT,
    user_id    VARCHAR(36)  NOT NULL,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME     NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS twofa_enabled TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS twofa_secret VARCHAR(64) DEFAULT NULL;

CREATE TABLE IF NOT EXISTS user_2fa_backup_codes (
    id         INT          NOT NULL AUTO_INCREMENT,
    user_id    VARCHAR(36)  NOT NULL,
    code_hash  VARCHAR(255) NOT NULL,
    used_at    DATETIME     DEFAULT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_twofa_user (user_id),
    INDEX idx_twofa_hash (code_hash),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
