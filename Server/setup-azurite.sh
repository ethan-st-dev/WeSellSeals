#!/bin/bash

echo "🚀 Setting up WeSellSeals with Azurite Blob Storage..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create data directory
mkdir -p ./azurite-data
echo "✓ Created azurite-data directory"

# Check if sample data exists
if [ ! -f "./SampleData/products.json" ]; then
    echo "❌ SampleData/products.json not found!"
    exit 1
fi

# Count model and image files
MODEL_COUNT=$(find ./SampleData/models -type f -name "*.glb" 2>/dev/null | wc -l)
IMAGE_COUNT=$(find ./SampleData/images -type f \( -name "*.png" -o -name "*.jpg" \) 2>/dev/null | wc -l)

echo "✓ Found $MODEL_COUNT model files"
echo "✓ Found $IMAGE_COUNT image files"

# Start Azurite
echo ""
echo "Starting Azurite blob storage emulator..."
docker-compose up -d

# Wait for Azurite to be ready
echo "Waiting for Azurite to be ready..."
sleep 3

# Check if Azurite is running
if curl -s http://127.0.0.1:10000 > /dev/null 2>&1; then
    echo "✓ Azurite is running on http://127.0.0.1:10000"
else
    echo "❌ Azurite failed to start"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run: dotnet run"
echo "  2. Server will automatically upload sample data to Azurite"
echo "  3. Access API at: http://localhost:5159"
echo ""
echo "To stop Azurite: docker-compose down"
echo "To view logs: docker-compose logs -f"
