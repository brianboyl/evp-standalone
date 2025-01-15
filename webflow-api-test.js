const fetch = require('node-fetch');
require('dotenv').config();

async function testWebflowAPI() {
    const config = {
        token: process.env.WEBFLOW_API_TOKEN,
        siteId: process.env.WEBFLOW_SITE_ID,
        collectionId: process.env.WEBFLOW_COLLECTION_ID
    };

    console.log('=== Webflow API Test Script ===');
    console.log('Testing with:');
    console.log('Site ID:', config.siteId);
    console.log('Collection ID:', config.collectionId);
    console.log('API Token Length:', config.token.length);
    console.log('Rate Limit: 120 requests per minute\n');

    async function makeRequest(endpoint, description) {
        console.log(`\n=== Testing ${description} ===`);
        try {
            const startTime = Date.now();
            const response = await fetch(
                `https://api.webflow.com/v2${endpoint}`,
                {
                    headers: {
                        'Authorization': `Bearer ${config.token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            const responseTime = Date.now() - startTime;
            console.log('Request URL:', `https://api.webflow.com/v2${endpoint}`);
            console.log('Response Time:', `${responseTime}ms`);
            console.log('Status Code:', response.status);
            console.log('Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

            const data = await response.json();
            console.log('Response Body:', JSON.stringify(data, null, 2));

            return { success: response.ok, data, status: response.status };
        } catch (error) {
            console.error('Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Test 1: List All Sites
    await makeRequest('/sites', 'List All Sites');

    // Test 2: Get Specific Site
    await makeRequest(`/sites/${config.siteId}`, 'Get Specific Site');

    // Test 3: List Site Collections
    await makeRequest(`/sites/${config.siteId}/collections`, 'List Site Collections');

    // Test 4: Get Specific Collection
    await makeRequest(`/collections/${config.collectionId}`, 'Get Specific Collection');

    // Test 5: Get Collection Items
    await makeRequest(`/collections/${config.collectionId}/items`, 'Get Collection Items');
}

console.log('Starting Webflow API Tests...\n');
testWebflowAPI()
    .then(() => console.log('\nAPI Tests Completed'))
    .catch(error => console.error('\nTest Suite Error:', error));
