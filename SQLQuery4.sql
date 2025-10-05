

USE [charityevents_db];
GO

-- Drop tables if they exist
IF OBJECT_ID('dbo.registrations', 'U') IS NOT NULL DROP TABLE dbo.registrations;
IF OBJECT_ID('dbo.tickets', 'U') IS NOT NULL DROP TABLE dbo.tickets;
IF OBJECT_ID('dbo.events', 'U') IS NOT NULL DROP TABLE dbo.events;
IF OBJECT_ID('dbo.categories', 'U') IS NOT NULL DROP TABLE dbo.categories;
IF OBJECT_ID('dbo.organisations', 'U') IS NOT NULL DROP TABLE dbo.organisations;
GO

-- Create tables (same as your original script)
CREATE TABLE dbo.organisations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX) NULL,
    contact_email NVARCHAR(150) NULL,
    contact_phone NVARCHAR(30) NULL,
    website NVARCHAR(255) NULL,
    created_at DATETIME2 DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255) NULL
);
GO

CREATE TABLE dbo.events (
    id INT IDENTITY(1,1) PRIMARY KEY,
    organisation_id INT NOT NULL,
    category_id INT NULL,
    name NVARCHAR(200) NOT NULL,
    short_description NVARCHAR(255) NULL,
    full_description NVARCHAR(MAX) NULL,
    start_datetime DATETIME2 NOT NULL,
    end_datetime DATETIME2 NULL,
    location NVARCHAR(255) NULL,
    city NVARCHAR(100) NULL,
    image_url NVARCHAR(255) NULL,
    ticket_price DECIMAL(10,2) DEFAULT (0.00),
    goal_amount DECIMAL(12,2) DEFAULT (0.00),
    suspended BIT DEFAULT (0),
    created_at DATETIME2 DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.tickets (
    id INT IDENTITY(1,1) PRIMARY KEY,
    event_id INT NOT NULL,
    type NVARCHAR(50) NULL,
    price DECIMAL(10,2) NULL,
    quantity INT DEFAULT (0)
);
GO

CREATE TABLE dbo.registrations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    event_id INT NOT NULL,
    name NVARCHAR(150) NULL,
    email NVARCHAR(150) NULL,
    amount DECIMAL(10,2) DEFAULT (0.00),
    registered_at DATETIME2 DEFAULT SYSDATETIME()
);
GO

-- Add foreign keys
ALTER TABLE dbo.events
    ADD CONSTRAINT FK_events_organisations FOREIGN KEY (organisation_id)
        REFERENCES dbo.organisations(id)
        ON DELETE CASCADE;
GO

ALTER TABLE dbo.events
    ADD CONSTRAINT FK_events_categories FOREIGN KEY (category_id)
        REFERENCES dbo.categories(id)
        ON DELETE SET NULL;
GO

ALTER TABLE dbo.tickets
    ADD CONSTRAINT FK_tickets_events FOREIGN KEY (event_id)
        REFERENCES dbo.events(id)
        ON DELETE CASCADE;
GO

ALTER TABLE dbo.registrations
    ADD CONSTRAINT FK_registrations_events FOREIGN KEY (event_id)
        REFERENCES dbo.events(id)
        ON DELETE CASCADE;
GO

-- Insert sample data
INSERT INTO dbo.organisations (name, description, contact_email, website)
VALUES
  (N'CityCare Foundation', N'Local charity supporting health initiatives', N'info@citycare.org', N'https://citycare.example'),
  (N'GreenSteps', N'Environmental conservation community', N'contact@greensteps.org', N'https://greensteps.example');

INSERT INTO dbo.categories (name, description)
VALUES
  (N'Fun Run', N'Community running events'),
  (N'Gala', N'Formal fundraising dinner'),
  (N'Auction', N'Silent or live auction events'),
  (N'Concert', N'Charity concerts and performances');

INSERT INTO dbo.events (organisation_id, category_id, name, short_description, full_description, start_datetime, end_datetime, location, city, image_url, ticket_price, goal_amount)
VALUES
 (1, 1, N'Riverbank Fun Run 2025', N'5km run for mental health', N'A family-friendly 5km fun run...', '2025-11-15 08:00:00', '2025-11-15 11:00:00', N'Riverbank Park', N'Rivertown', NULL, 25.00, 5000.00),
 (1, 2, N'Hope Gala 2025', N'Annual gala dinner to raise funds', N'Join us for a night of dinner and auction...', '2025-12-05 18:00:00', '2025-12-05 22:00:00', N'Grand Hotel Ballroom', N'Rivertown', NULL, 150.00, 20000.00),
 (2, 4, N'GreenSteps Concert', N'Benefit concert for conservation', N'Live bands perform to support tree planting', '2025-10-20 19:00:00', '2025-10-20 22:30:00', N'Open Air Amphitheatre', N'Rivertown', NULL, 40.00, 8000.00),
 (2, 3, N'Community Auction', N'Silent auction to fund local projects', N'Items donated by local businesses...', '2025-09-30 17:00:00', '2025-09-30 20:00:00', N'Community Centre', N'Rivertown', NULL, 0.00, 3000.00),
 (1, 1, N'Kids Mini Run', N'1km fun run for kids', N'A short run and sports day for children.', '2025-08-10 09:00:00', '2025-08-10 11:00:00', N'School Grounds', N'Rivertown', NULL, 0.00, 500.00),
 (1, 3, N'Charity Silent Auction', N'Evening auction to raise funds', N'A more intimate auction for collectors.', '2025-10-25 18:30:00', '2025-10-25 21:00:00', N'Art House', N'Rivertown', NULL, 20.00, 4000.00),
 (2, 4, N'Youth Charity Concert', N'Local youth bands', N'Support youth music programmes', '2025-11-02 18:00:00', '2025-11-02 21:00:00', N'High School Auditorium', N'Rivertown', NULL, 15.00, 2500.00),
 (1, 2, N'Winter Charity Ball', N'Formal ball with live orchestra', N'Black-tie event supporting outreach', '2025-12-18 19:00:00', '2025-12-19 01:00:00', N'Town Hall', N'Rivertown', NULL, 180.00, 25000.00);
GO

-- Verify
SELECT COUNT(*) AS OrganisationsCount FROM dbo.organisations;
SELECT COUNT(*) AS CategoriesCount FROM dbo.categories;
SELECT COUNT(*) AS EventsCount FROM dbo.events;
GO

