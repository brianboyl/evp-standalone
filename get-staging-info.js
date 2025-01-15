const fetch = require('node-fetch');
require('dotenv').config();

async function getStagingInfo() {
    try {
        // First, let's try to get the site info using the staging endpoint
        console.log('Attempting to access staging site...');
        const siteResponse = await fetch(`https://api.webflow.com/sites/${process.env.WEBFLOW_SITE_ID}?domains=true`, {
            headers: {
                'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                'accept-version': '1.0.0'
            }
        });

        console.log('\nSite Response Status:', siteResponse.status);
        console.log('Site Response Headers:', JSON.stringify(Object.fromEntries(siteResponse.headers.entries()), null, 2));
        
        const siteData = await siteResponse.json();
        console.log('\nSite Info:', JSON.stringify(siteData, null, 2));

        // Now try to get collections for the staging site
        console.log('\nAttempting to get collections...');
        const collectionsResponse = await fetch(
            `https://api.webflow.com/sites/${process.env.WEBFLOW_SITE_ID}/collections`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                    'accept-version': '1.0.0',
                    'Accept': 'application/json'
                }
            }
        );

        console.log('\nCollections Response Status:', collectionsResponse.status);
        console.log('Collections Headers:', JSON.stringify(Object.fromEntries(collectionsResponse.headers.entries()), null, 2));
        
        const collectionsData = await collectionsResponse.json();
        console.log('\nCollections Data:', JSON.stringify(collectionsData, null, 2));

        // Print token info for debugging
        console.log('\nToken Info:');
        console.log('Token (first 8 chars):', process.env.WEBFLOW_API_TOKEN.substring(0, 8) + '...');
        console.log('Token length:', process.env.WEBFLOW_API_TOKEN.length);

    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

getStagingInfo();
