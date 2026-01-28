#!/bin/bash

echo "🛑 Stopping WeSellSeals SQL Server..."

if [ "$(docker ps -q -f name=wesellseals-sqlserver)" ]; then
    docker stop wesellseals-sqlserver
    echo "✅ SQL Server stopped"
    echo "💡 Data is persisted in ./sqlserver-data/"
    echo "💡 To start again: ./start-db.sh"
else
    echo "ℹ️  SQL Server is not running"
fi
