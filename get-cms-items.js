const fetch = require('node-fetch');
require('dotenv').config();

async function getCMSItems() {
    try {
        console.log('Attempting to fetch CMS items...');
        console.log('Collection ID:', process.env.WEBFLOW_COLLECTION_ID);
        
        const response = await fetch(
            `https://api.webflow.com/collections/${process.env.WEBFLOW_COLLECTION_ID}/items`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                    'accept-version': '1.0.0',
                    'Accept': 'application/json'
                }
            }
        );

        console.log('\nResponse Status:', response.status);
        console.log('Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('\nSuccessfully retrieved items!');
            console.log('Total Items:', data.items ? data.items.length : 0);
            console.log('\nFirst item preview:', data.items && data.items[0] ? JSON.stringify(data.items[0], null, 2) : 'No items found');
        } else {
            console.log('\nError Response:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

getCMSItems();
