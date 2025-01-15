#!/bin/bash

# Load environment variables from .env file
source .env

echo "Testing Webflow API with cURL..."

# Test 1: List All Sites
echo -e "\n=== Testing List All Sites ==="
curl -v -H "Authorization: Bearer $WEBFLOW_API_TOKEN" \
     -H "accept-version: 1.0.0" \
     https://api.webflow.com/sites

# Test 2: Get Specific Collection
echo -e "\n\n=== Testing Get Specific Collection ==="
curl -v -H "Authorization: Bearer $WEBFLOW_API_TOKEN" \
     -H "accept-version: 1.0.0" \
     https://api.webflow.com/collections/$WEBFLOW_COLLECTION_ID

# Test 3: Get Collection Items
echo -e "\n\n=== Testing Get Collection Items ==="
curl -v -H "Authorization: Bearer $WEBFLOW_API_TOKEN" \
     -H "accept-version: 1.0.0" \
     https://api.webflow.com/collections/$WEBFLOW_COLLECTION_ID/items
