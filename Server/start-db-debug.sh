#!/bin/bash

echo "🚀 Starting WeSellSeals SQL Server (Debug Mode)..."

cd /Volumes/MoarSpace/Projects/WeSellSeals/Server

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi

echo "✅ Docker is running"

# Clean up
echo "🧹 Cleaning up old containers..."
docker-compose down 2>/dev/null
docker rm -f wesellseals-sqlserver 2>/dev/null

# Start fresh
echo "📦 Starting SQL Server..."
docker-compose up -d

echo "⏳ Waiting 15 seconds for SQL Server to start..."
sleep 15

# Check if container is running
if docker ps | grep -q wesellseals-sqlserver; then
    echo "✅ Container is running"
    
    # Check logs
    echo ""
    echo "📋 Container logs:"
    docker logs wesellseals-sqlserver | tail -20
    
    # Try to connect
    echo ""
    echo "🔍 Attempting connection..."
    docker exec wesellseals-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "SELECT @@VERSION"
    
    if [ $? -eq 0 ]; then
        echo "✅ SQL Server is ready!"
    else
        echo "⚠️  SQL Server is running but not responding yet. Waiting..."
        sleep 15
    fi
else
    echo "❌ Container failed to start"
    echo ""
    echo "📋 Docker logs:"
    docker logs wesellseals-sqlserver
    exit 1
fi
