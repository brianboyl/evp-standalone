const fetch = require('node-fetch');
require('dotenv').config();

async function getCollections() {
    try {
        console.log('Attempting to fetch collections with:');
        console.log('Site ID:', process.env.WEBFLOW_SITE_ID);
        
        const response = await fetch(
            `https://api.webflow.com/sites/${process.env.WEBFLOW_SITE_ID}/collections`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                    'accept-version': '1.0.0'
                }
            }
        );
        
        console.log('\nResponse Status:', response.status);
        console.log('Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
        
        const data = await response.json();
        console.log('\nAPI Response:', JSON.stringify(data, null, 2));
        
        if (Array.isArray(data)) {
            console.log('\nFound Collections:');
            data.forEach(collection => {
                console.log(`\nName: ${collection.name}`);
                console.log(`ID: ${collection._id}`);
                console.log(`Slug: ${collection.slug}`);
                console.log('-------------------');
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

getCollections();
