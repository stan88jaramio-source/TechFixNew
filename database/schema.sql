-- ===================================================================
-- TechFix Pro – SQL Server Schema
-- Run this script to create the database manually (alternative to
-- EF Core automatic migrations).
-- ===================================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'TechFixDB')
    CREATE DATABASE TechFixDB;
GO

USE TechFixDB;
GO

-- ── Users ──────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
CREATE TABLE Users (
    Id          UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID()    PRIMARY KEY,
    Name        NVARCHAR(200)     NOT NULL,
    Email       NVARCHAR(200)     NOT NULL,
    PasswordHash NVARCHAR(MAX)    NOT NULL,
    Role        NVARCHAR(50)      NOT NULL DEFAULT 'technician',
    CreatedAt   DATETIME2         NOT NULL DEFAULT GETUTCDATE()
);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Email')
    CREATE UNIQUE INDEX IX_Users_Email ON Users (Email);
GO

-- ── Clients ────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Clients')
CREATE TABLE Clients (
    Id          UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID()    PRIMARY KEY,
    Name        NVARCHAR(200)     NOT NULL,
    Phone       NVARCHAR(50)      NOT NULL,
    Email       NVARCHAR(200)     NULL,
    Address     NVARCHAR(500)     NULL,
    CreatedAt   DATETIME2         NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ── Repairs ────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Repairs')
CREATE TABLE Repairs (
    Id                   UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID()                         PRIMARY KEY,
    OrderNumber          NVARCHAR(30)      NOT NULL,
    ClientId             UNIQUEIDENTIFIER  NOT NULL,
    DeviceBrand          NVARCHAR(200)     NOT NULL,
    DeviceModel          NVARCHAR(200)     NOT NULL,
    Imei                 NVARCHAR(50)      NULL,
    IssueDescription     NVARCHAR(1000)    NOT NULL,
    Status               NVARCHAR(30)      NOT NULL DEFAULT 'recibido',
    EstimatedCost        DECIMAL(10,2)     NULL,
    FinalCost            DECIMAL(10,2)     NULL,
    TechnicianNotes      NVARCHAR(2000)    NULL,
    Accessories          NVARCHAR(500)     NULL,
    EstimatedCompletion  NVARCHAR(100)     NULL,
    CreatedAt            DATETIME2         NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt            DATETIME2         NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT FK_Repairs_Clients FOREIGN KEY (ClientId)
        REFERENCES Clients(Id) ON DELETE CASCADE
);
GO

-- ── Seed admin user (password: admin123  hashed with BCrypt) ───────
-- NOTE: EF Core Program.cs seeding handles this automatically.
-- Uncomment if running the script standalone:
--
-- INSERT INTO Users (Id, Name, Email, PasswordHash, Role, CreatedAt)
-- SELECT NEWID(), 'Admin TechFix', 'admin@techfix.com',
--        '$2a$10$...BCrypt hash of admin123...',
--        'admin', GETUTCDATE()
-- WHERE NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'admin@techfix.com');
-- GO

PRINT 'TechFixDB schema created/verified successfully.';
GO
