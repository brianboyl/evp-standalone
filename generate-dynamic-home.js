const fs = require('fs').promises;
const fetch = require('node-fetch');
const cheerio = require('cheerio');
require('dotenv').config();

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
        // First try to read from cache
        try {
            const cacheData = await fs.readFile('cache/stories.json', 'utf8');
            const cache = JSON.parse(cacheData);
            
            // Check if cache is older than 1 hour
            const cacheAge = Date.now() - new Date(cache.timestamp).getTime();
            const oneHour = 60 * 60 * 1000;
            
            if (cacheAge < oneHour) {
                console.log('Using cached stories');
                return cache.stories;
            } else {
                console.log('Cache is older than 1 hour, fetching fresh stories...');
            }
        } catch (error) {
            console.log('No valid cache found, fetching fresh stories...');
        }
        
        // If cache is invalid or too old, fetch fresh stories
        const response = await fetch(
            `https://api.webflow.com/v2/collections/${process.env.WEBFLOW_COLLECTION_ID}/items`,
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

        // Cache the stories
        await fs.writeFile('cache/stories.json', JSON.stringify({ timestamp: new Date().toISOString(), stories }));

        return stories;
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
                <div class="storyitemtextblock">
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
        </div>
    `;
}

function generateCategorySection(categoryName, stories) {
    const randomStories = shuffleArray([...stories]).slice(0, 4); // Get 4 random stories

    if (randomStories.length === 0) {
        console.log(`No stories found for category: ${categoryName}`);
        return '';
    }

    return `
        <section class="content-section">
            <div class="topic-section-header">
                <h1 class="section-header">${categoryName}</h1>
            </div>
            <div class="storywrappernofeat w-dyn-list">
                <div role="list" class="landingstorysection w-dyn-items">
                    ${randomStories.map(story => generateStoryCard(story)).join('\n')}
                </div>
            </div>
            <div class="topic-section-footer">
                <a href="/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}" class="w-inline-block">
                    <h1 class="section-footer-link-text">More ${categoryName}...</h1>
                </a>
            </div>
        </section>
    `;
}

async function generateDynamicHome(outputPath = 'dynamic-pages/home.html') {
    try {
        // Read the template file
        const template = await fs.readFile('dynamic-pages/template.html', 'utf8');
        const $ = cheerio.load(template, { decodeEntities: false });

        // Fetch all stories
        const stories = await fetchStories();
        console.log(`Fetched ${stories.length} stories`);

        // Keep track of which stories have been used
        const usedStoryIds = new Set();

        // Find the container where we want to insert our sections
        const $container = $('.pagewrapper');
        if (!$container.length) {
            throw new Error('Could not find .pagewrapper container');
        }

        // Find the first featured story
        let featuredStory = stories.find(story => story.fieldData['featured'] === true);
        if (!featuredStory) {
            console.warn('No featured story found. Please set at least one story as featured in Webflow.');
            // Use the first story as a fallback
            featuredStory = stories[0];
            console.log('Using first story as fallback:', featuredStory.fieldData['main-title']);
        }

        // Add featured story to used stories
        usedStoryIds.add(featuredStory.id);
        console.log('Added featured story to used stories:', featuredStory.fieldData['main-title']);
        
        // Populate the landing cover (for larger screens)
        const $landingCover = $('.landingcoverwrapper .coversection');
        if ($landingCover.length) {
            $landingCover.find('.coverimage').attr('src', featuredStory.fieldData['main-image']?.url);
            $landingCover.find('.coverimage').attr('alt', featuredStory.fieldData['main-title']);
            $landingCover.find('.coverphotocredit').text(PHOTOGRAPHERS[featuredStory.fieldData['photographer']] || featuredStory.fieldData['photographer']);
            $landingCover.find('.coverheading').text(featuredStory.fieldData['main-title']);
            $landingCover.find('.readonbutton').attr('href', `/stories/${featuredStory.slug}`);
        }

        // Populate the featured story section (for mobile)
        const $featuredSection = $('.storywrapperfeatonly .storyitem');
        if ($featuredSection.length) {
            $featuredSection.find('.storyitemimage').attr('src', featuredStory.fieldData['big-thumbnail']?.url);
            $featuredSection.find('.storyitemimage').attr('alt', featuredStory.fieldData['main-title']);
            $featuredSection.find('.coverphotocredit').text(PHOTOGRAPHERS[featuredStory.fieldData['photographer']] || featuredStory.fieldData['photographer']);
            $featuredSection.find('.storyitemheading').text(featuredStory.fieldData['main-title']);
            $featuredSection.find('.storyitemsubhead').text(featuredStory.fieldData['subtitle']);
            $featuredSection.find('.storyitembyline').text(AUTHORS[featuredStory.fieldData['author']] || featuredStory.fieldData['author']);
            $featuredSection.find('.storyitemteasertext').text(featuredStory.fieldData['content-summary']);
            $featuredSection.find('.link-block-2').attr('href', `/stories/${featuredStory.slug}`);
            $featuredSection.find('.cms-item').attr('data-id', featuredStory.slug);
        }

        // Get tags from the featured story
        const featuredTags = featuredStory.fieldData['tags'] || [];
        console.log('Featured story tags:', featuredTags);

        // Find all stories that share at least one tag with the featured story
        const relatedStories = stories.filter(story => {
            // Skip used stories and the featured story itself
            if (usedStoryIds.has(story.id)) return false;
            
            // Get this story's tags
            const storyTags = story.fieldData['tags'] || [];
            
            // Check if any tags match
            return storyTags.some(tag => featuredTags.includes(tag));
        });
        console.log(`Found ${relatedStories.length} stories with matching tags`);

        // Randomly select 4 stories (or fewer if we don't have 4)
        const selectedStories = shuffleArray([...relatedStories]).slice(0, 4);
        console.log(`Selected ${selectedStories.length} stories for Featured section`);

        // Add selected stories to used stories
        selectedStories.forEach(story => {
            usedStoryIds.add(story.id);
            console.log('Added Featured story to used stories:', story.fieldData['main-title']);
        });

        // Populate the Featured stories section with randomly selected related stories
        const $featuredList = $('.storywrappernofeat .landingstorysection');
        if ($featuredList.length && selectedStories.length > 0) {
            console.log('Populating Featured section with stories:', selectedStories.map(s => s.fieldData['main-title']));
            const featuredHtml = selectedStories.map(story => generateStoryCard(story)).join('\n');
            $featuredList.html(featuredHtml);
        }

        // Generate new content sections, excluding used stories
        const contentSections = Object.keys(CATEGORIES)
            .map(category => {
                // Filter out used stories before generating the section
                const availableStories = stories.filter(story => !usedStoryIds.has(story.id));
                console.log(`\nGenerating ${category} section with ${availableStories.length} available stories`);
                
                // Get stories for this category
                const categoryStories = filterStoriesByCategory(availableStories, CATEGORIES[category]);
                console.log(`Found ${categoryStories.length} stories for ${category}`);
                
                // Get random stories for this section
                const randomStories = shuffleArray([...categoryStories]).slice(0, 4);
                console.log(`Selected ${randomStories.length} stories for ${category}:`, randomStories.map(s => s.fieldData['main-title']));
                
                // Add these stories to used stories
                randomStories.forEach(story => {
                    usedStoryIds.add(story.id);
                    console.log(`Added ${category} story to used stories:`, story.fieldData['main-title']);
                });
                
                // Generate the section HTML
                return generateCategorySection(category, randomStories);
            })
            .filter(Boolean)
            .join('\n');

        // Insert the new content sections into the container
        $container.append(contentSections);

        // Write the modified file
        await fs.writeFile(outputPath, $.html());
        console.log(`Successfully generated page at ${outputPath}`);

    } catch (error) {
        console.error('Error generating dynamic home:', error);
        throw error;
    }
}

// If run directly, check for command line arguments
if (require.main === module) {
    const args = process.argv.slice(2);
    const outputPath = args[0] || 'dynamic-pages/home.html';
    generateDynamicHome(outputPath);
}

module.exports = generateDynamicHome;
