// config.js
require('dotenv').config();

const config = {
    webflow: {
        apiToken: process.env.WEBFLOW_API_TOKEN,
        siteId: process.env.WEBFLOW_SITE_ID,
        collectionId: process.env.WEBFLOW_COLLECTION_ID
    }
};

// Only export what's needed, never expose the raw token
module.exports = {
    getWebflowConfig: () => ({
        siteId: config.webflow.siteId,
        collectionId: config.webflow.collectionId
    }),
    getWebflowHeaders: () => ({
        'Authorization': `Bearer ${config.webflow.apiToken}`,
        'accept-version': '1.0.0',
        'Content-Type': 'application/json'
    })
};
