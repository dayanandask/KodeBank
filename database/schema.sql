-- Kodbank Database Schema
-- Target: Aiven MySQL

CREATE DATABASE IF NOT EXISTS kodbank;
USE kodbank;

-- User Table
CREATE TABLE IF NOT EXISTS KodUser (
    uid INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 100000.00,
    phone VARCHAR(20),
    role ENUM('Customer', 'Manager', 'Admin') DEFAULT 'Customer'
);

-- Token Table for Session Management
CREATE TABLE IF NOT EXISTS UserToken (
    tid INT AUTO_INCREMENT PRIMARY KEY,
    token TEXT NOT NULL,
    uid INT NOT NULL,
    expairy DATETIME NOT NULL,
    FOREIGN KEY (uid) REFERENCES KodUser(uid) ON DELETE CASCADE
);
