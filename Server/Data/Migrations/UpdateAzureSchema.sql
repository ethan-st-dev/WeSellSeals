-- Azure SQL Database Migration Script
-- Updates Products table to support file uploads

-- Check if ModelUrl column exists, if not add it
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND name = 'ModelUrl')
BEGIN
    ALTER TABLE [dbo].[Products]
    ADD [ModelUrl] NVARCHAR(500) NULL;
    PRINT 'Added ModelUrl column';
END
ELSE
BEGIN
    PRINT 'ModelUrl column already exists';
END

-- Ensure Image column has correct size
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND name = 'Image' AND max_length < 1000)
BEGIN
    ALTER TABLE [dbo].[Products]
    ALTER COLUMN [Image] NVARCHAR(500) NOT NULL;
    PRINT 'Updated Image column length';
END
ELSE
BEGIN
    PRINT 'Image column size is correct';
END

-- Make UpdatedAt nullable if it isn't already
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND name = 'UpdatedAt' AND is_nullable = 0)
BEGIN
    ALTER TABLE [dbo].[Products]
    ALTER COLUMN [UpdatedAt] DATETIME2 NULL;
    PRINT 'Made UpdatedAt nullable';
END
ELSE
BEGIN
    PRINT 'UpdatedAt is already nullable';
END

PRINT 'Migration completed successfully';
GO
