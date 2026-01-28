#!/bin/bash

echo "🚀 Starting WeSellSeals SQL Server..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Check if container exists
if [ "$(docker ps -aq -f name=wesellseals-sqlserver)" ]; then
    if [ "$(docker ps -q -f name=wesellseals-sqlserver)" ]; then
        echo "✅ SQL Server is already running"
    else
        echo "🔄 Starting existing SQL Server container..."
        docker start wesellseals-sqlserver
        echo "⏳ Waiting for SQL Server to be ready..."
        sleep 5
    fi
else
    echo "📦 Creating new SQL Server container..."
    docker-compose up -d
    echo "⏳ Waiting for SQL Server to initialize (first time takes ~30s)..."
    sleep 30
fi

# Wait for SQL Server to be healthy
echo "🔍 Checking SQL Server health..."
max_attempts=30
attempt=0
until docker exec wesellseals-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "SELECT 1" > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "❌ SQL Server failed to start after $max_attempts attempts"
        exit 1
    fi
    echo "⏳ Waiting for SQL Server... (attempt $attempt/$max_attempts)"
    sleep 2
done

echo "✅ SQL Server is ready!"

# Check Azurite
if docker ps | grep -q wesellseals-azurite; then
    echo "✅ Azurite (Blob Storage) is ready!"
else
    echo "⚠️  Azurite is not running"
fi

echo ""
echo "📊 Connection Details:"
echo ""
echo "🗄️  SQL Server:"
echo "   Server: localhost,1433"
echo "   Database: wesellseals_dev"
echo "   User: sa"
echo "   Password: YourStrong@Passw0rd"
echo ""
echo "📦 Azurite (Blob Storage):"
echo "   Blob Endpoint: http://localhost:10000/devstoreaccount1"
echo "   Container: seal-models"
echo ""
echo "🔧 Running database migrations..."
if dotnet ef database update; then
    echo "✅ Migrations applied successfully!"
else
    echo "⚠️  Migration failed. You may need to run 'dotnet ef database update' manually."
fi

echo ""
echo "✅ Database is ready for development!"
echo "💡 To stop: ./stop-db.sh"
