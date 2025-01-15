const fetch = require('node-fetch');
require('dotenv').config();

async function checkSite() {
    try {
        console.log('Checking site access...');
        console.log('Site ID:', process.env.WEBFLOW_SITE_ID);
        
        // Try to get site info
        const siteResponse = await fetch(
            `https://api.webflow.com/sites/${process.env.WEBFLOW_SITE_ID}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                    'accept-version': '1.0.0'
                }
            }
        );

        console.log('\nSite Info Response Status:', siteResponse.status);
        console.log('Response Headers:', JSON.stringify(Object.fromEntries(siteResponse.headers.entries()), null, 2));
        
        const siteData = await siteResponse.json();
        console.log('\nSite Info:', JSON.stringify(siteData, null, 2));

        // Also try to list all sites
        console.log('\nTrying to list all accessible sites...');
        const allSitesResponse = await fetch(
            'https://api.webflow.com/sites',
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                    'accept-version': '1.0.0'
                }
            }
        );

        const allSitesData = await allSitesResponse.json();
        console.log('\nAll Sites Response:', JSON.stringify(allSitesData, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

checkSite();
