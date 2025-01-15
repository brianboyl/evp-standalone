const fetch = require('node-fetch');
require('dotenv').config();

async function getSites() {
    try {
        console.log('Fetching all sites...');
        const response = await fetch('https://api.webflow.com/sites', {
            headers: {
                'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                'accept-version': '1.0.0'
            }
        });
        
        console.log('\nAll Sites Response Status:', response.status);
        console.log('Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
        
        const data = await response.json();
        console.log('\nAll Sites Response:', JSON.stringify(data, null, 2));
        
        // Try to access the specific site
        console.log('\nTrying to access specific site...');
        console.log('Site ID:', process.env.WEBFLOW_SITE_ID);
        
        const siteResponse = await fetch(`https://api.webflow.com/sites/${process.env.WEBFLOW_SITE_ID}`, {
            headers: {
                'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                'accept-version': '1.0.0'
            }
        });
        
        console.log('\nSpecific Site Response Status:', siteResponse.status);
        console.log('Response Headers:', JSON.stringify(Object.fromEntries(siteResponse.headers.entries()), null, 2));
        
        const siteData = await siteResponse.json();
        console.log('\nSpecific Site Response:', JSON.stringify(siteData, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

getSites();
