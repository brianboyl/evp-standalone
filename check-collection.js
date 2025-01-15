const fetch = require('node-fetch');
require('dotenv').config();

async function checkCollection() {
    try {
        console.log('Checking collection access...');
        console.log('Collection ID:', process.env.WEBFLOW_COLLECTION_ID);
        console.log('Token Length:', process.env.WEBFLOW_API_TOKEN.length);
        
        // First, try to get collection info
        const collectionResponse = await fetch(
            `https://api.webflow.com/collections/${process.env.WEBFLOW_COLLECTION_ID}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                    'accept-version': '1.0.0',
                    'Accept': 'application/json'
                }
            }
        );

        console.log('\nCollection Info Response Status:', collectionResponse.status);
        console.log('Response Headers:', JSON.stringify(Object.fromEntries(collectionResponse.headers.entries()), null, 2));
        
        const collectionData = await collectionResponse.json();
        console.log('\nCollection Info:', JSON.stringify(collectionData, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

checkCollection();
