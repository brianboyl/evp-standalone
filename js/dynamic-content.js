// Categories and their corresponding tag IDs
const CATEGORIES = {
    'Articles': ['666a6c762536fd5cf0bd7f33'],
    'Art & Design': ['612d7a8b8019a9e99c4a2852', '612d7a598052f46147a873dc'],
    'Outdoor Activities': ['612d7ab3be86e69bec316fd9', '615072e85bd34c10889710aa'],
    'Roadside Attractions': ['612d7ad69511a722188af085', '612d7ae98938e83e79ae337c'],
    'Nature': ['612d7acb4f8d5a7e91be840a', '612d82770d2a5222be716c6f'],
    'Play': ['612d7a69be08433c0906cf70', '612d7a40ea4449035d215cd7']
};

// Author and photographer mappings
const AUTHORS = {
    '612e683242673a05f052db42': 'Krystina Castella'
};

const PHOTOGRAPHERS = {
    '612e693dc13e672b389de11c': 'Krystina Castella',
    '612e69221a4899ad4b38c7cf': 'Brian Boyl'
};

async function fetchStories() {
    try {
        const response = await fetch(
            `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items`,
            {
                headers: {
                    'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
                    'accept-version': '2.0.0',
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch stories: ${response.status}`);
        }

        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error fetching stories:', error);
        return [];
    }
}

function filterStoriesByCategory(stories, categoryTagIds) {
    return stories.filter(story => {
        const storyTagIds = story.fieldData.tags || [];
        return categoryTagIds.some(tagId => storyTagIds.includes(tagId));
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateStoryCard(story) {
    const { fieldData } = story;
    const authorName = AUTHORS[fieldData['author']] || fieldData['author'];
    const photographerName = PHOTOGRAPHERS[fieldData['photographer']] || fieldData['photographer'];
    
    return `
        <div role="listitem" class="storyitem w-dyn-item">
            <div class="storyitemlinkblock">
                ${fieldData['big-thumbnail']?.url ? 
                    `<img src="${fieldData['big-thumbnail'].url}" 
                         loading="lazy" 
                         alt="${fieldData['main-title'] || ''}" 
                         class="storyitemimage">` : ''}
                <div class="photocreditblock">
                    <div class="phototext">Photo:</div>
                    <div class="coverphotocredit">${photographerName}</div>
                </div>
                <h2 class="storyitemheading">${fieldData['main-title'] || ''}</h2>
                <h3 class="storyitemsubhead">${fieldData['subtitle'] || ''}</h3>
                <h4 class="storyitembyline">${authorName}</h4>
                <div class="storyitemteasertext">${fieldData['content-summary'] || ''}</div>
                <a href="/stories/${story.slug}" class="link-block-2 w-inline-block">
                    <img src="https://cdn.prod.website-files.com/611592871745f6ed8d8306bc/614f085fb7876ca33c1520d6_Read%20On%20Button.svg" 
                         loading="lazy" 
                         alt="Click here to read more of the article.">
                </a>
            </div>
        </div>
    `;
}

function generateCategorySection(categoryName, stories) {
    const filteredStories = filterStoriesByCategory(stories, CATEGORIES[categoryName]);
    const randomStories = shuffleArray([...filteredStories]).slice(0, 4);

    if (randomStories.length === 0) {
        console.log(`No stories found for category: ${categoryName}`);
        return '';
    }

    const storyCards = randomStories.map(story => generateStoryCard(story)).join('');
    return storyCards;
}

async function updateCategoryContent() {
    const stories = await fetchStories();
    
    Object.keys(CATEGORIES).forEach(categoryName => {
        const sectionContent = generateCategorySection(categoryName, stories);
        const sectionElement = document.querySelector(`[data-category="${categoryName}"] .landingstorysection`);
        if (sectionElement) {
            sectionElement.innerHTML = sectionContent;
        }
    });
}

// Update content when the page loads
document.addEventListener('DOMContentLoaded', updateCategoryContent);

// Add a refresh button
const refreshButton = document.createElement('button');
refreshButton.textContent = 'Refresh Stories';
refreshButton.className = 'refresh-button';
refreshButton.addEventListener('click', updateCategoryContent);
document.querySelector('.pagewrapper').prepend(refreshButton);
