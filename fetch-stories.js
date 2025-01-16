const fs = require('fs').promises;
const fetch = require('node-fetch');
require('dotenv').config();

async function fetchAndCacheStories() {
    try {
        console.log('Fetching stories from Webflow...');
        let allStories = [];
        let offset = 0;
        const limit = 100; // Webflow's max items per request

        while (true) {
            console.log(`Fetching stories with offset ${offset}...`);
            const response = await fetch(
                `https://api.webflow.com/v2/collections/${process.env.WEBFLOW_COLLECTION_ID}/items?offset=${offset}&limit=${limit}`,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                        'accept-version': '2.0.0',
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch stories: ${response.status}`);
            }

            const data = await response.json();
            const stories = data.items || [];
            
            if (stories.length === 0) {
                break; // No more stories to fetch
            }
            
            allStories = allStories.concat(stories);
            console.log(`Fetched ${stories.length} stories (total: ${allStories.length})`);
            
            if (stories.length < limit) {
                break; // Last page (not a full page of results)
            }
            
            offset += limit;
        }
        
        // Add timestamp to cache
        const cache = {
            timestamp: new Date().toISOString(),
            stories: allStories
        };

        // Save to cache file
        await fs.mkdir('cache', { recursive: true });
        await fs.writeFile('cache/stories.json', JSON.stringify(cache, null, 2));
        
        console.log(`Successfully cached ${allStories.length} stories`);
        return allStories;
    } catch (error) {
        console.error('Error fetching stories:', error);
        throw error;
    }
}

// If this script is run directly, fetch and cache stories
if (require.main === module) {
    fetchAndCacheStories();
}

module.exports = fetchAndCacheStories;
