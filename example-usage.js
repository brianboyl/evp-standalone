const { getWebflowHeaders, getWebflowConfig } = require('./config');

async function fetchWebflowData() {
    const config = getWebflowConfig();
    const headers = getWebflowHeaders();
    
    const response = await fetch(
        `https://api.webflow.com/collections/${config.collectionId}/items`,
        { headers }
    );
    
    return response.json();
}
