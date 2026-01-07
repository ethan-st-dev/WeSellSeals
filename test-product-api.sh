#!/bin/bash

# Test script for Product API
# Make sure the server is running on http://localhost:5159

API_URL="http://localhost:5159"

echo "Testing Product CRUD API"
echo "========================"
echo ""

# Test 1: Create a product (without auth for now - will need to add auth token)
echo "1. Creating a test product..."
PRODUCT_DATA='{
  "id": "test-seal-1",
  "title": "Test Harbor Seal",
  "price": 9.99,
  "shortDescription": "A test seal for API testing",
  "longDescription": "This is a longer description for testing purposes",
  "category": "seals",
  "subcategory": "harbor",
  "tags": ["test", "marine", "seal"]
}'

curl -X POST "$API_URL/api/products" \
  -H "Content-Type: multipart/form-data" \
  -F "data=$PRODUCT_DATA" \
  | jq '.'

echo ""
echo ""

# Test 2: Get all products
echo "2. Getting all products..."
curl -s "$API_URL/api/products" | jq '.'

echo ""
echo ""

# Test 3: Get single product
echo "3. Getting single product (test-seal-1)..."
curl -s "$API_URL/api/products/test-seal-1" | jq '.'

echo ""
echo ""

# Test 4: Update product (will need auth)
echo "4. Updating product..."
UPDATE_DATA='{
  "title": "Updated Test Harbor Seal",
  "price": 12.99,
  "shortDescription": "Updated description",
  "category": "seals",
  "subcategory": "harbor",
  "tags": ["test", "marine", "seal", "updated"]
}'

curl -X PUT "$API_URL/api/products/test-seal-1" \
  -H "Content-Type: multipart/form-data" \
  -F "data=$UPDATE_DATA" \
  | jq '.'

echo ""
echo ""

# Test 5: Delete product (will need auth)
echo "5. Deleting product..."
curl -X DELETE "$API_URL/api/products/test-seal-1" -v

echo ""
echo ""
echo "Tests completed!"
