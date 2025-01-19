const fetch = require('node-fetch');
require('dotenv').config();

const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;
const WEBFLOW_COLLECTION_ID = process.env.WEBFLOW_COLLECTION_ID;

async function fetchCollectionItems() {
    let allItems = [];
    let offset = 0;
    const limit = 100;

    while (true) {
        const url = `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items?offset=${offset}&limit=${limit}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
                    'accept-version': '2.0.0',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                break; // No more items to fetch
            }

            const items = data.items.map(item => {
                return {
                    ...item,
                    fieldData: {
                        ...item.fieldData,
                        featured: item.fieldData['featured'] || item.fieldData['Featured']
                    }
                };
            });

            allItems = allItems.concat(items);
            offset += limit;

        } catch (error) {
            console.error('Error fetching collection items:', error);
            break;
        }
    }

    return allItems;
}

async function extractContent() {
    const items = await fetchCollectionItems();
    if (!items) return;

    items.forEach((item, index) => {
        const imageUrl = index === 0 ? item.fieldData['main-photo'] : item.fieldData['big-thumbnail'];
        const title = item.fieldData['main-title'];
        const photographer = item.fieldData['photographer'];
        const subtitle = item.fieldData['subtitle'];
        const author = item.fieldData['author'];
        const text = item.fieldData['content-summary'];
        const slug = item.fieldData['slug'];
        const link = `https://www.explorevisitplay.com/stories/${slug}`;

        console.log('Image URL:', imageUrl);
        console.log('Title:', title);
        console.log('Photographer:', photographer);
        console.log('Subtitle:', subtitle);
        console.log('Author:', author);
        console.log('Text:', text);
        console.log('Link:', link);
    });
}

extractContent();
