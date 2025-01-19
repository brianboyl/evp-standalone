const fs = require('fs').promises;
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config();

// Get the appropriate root directory based on environment
const PROJECT_ROOT = process.env.VERCEL ? '/tmp' : process.cwd();
console.log('Using project root:', PROJECT_ROOT);

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
        let allStories = [];
        let offset = 0;
        const limit = 100;
        
        // Try to read from cache first
        try {
            const cacheDir = path.join(PROJECT_ROOT, 'cache');
            const cacheFile = path.join(cacheDir, 'stories.json');
            
            // Create cache directory if it doesn't exist
            await fs.mkdir(cacheDir, { recursive: true });
            console.log('Cache directory:', cacheDir);
            
            const cacheData = await fs.readFile(cacheFile, 'utf8');
            const cache = JSON.parse(cacheData);
            
            // Check if cache is older than 1 hour
            const cacheTime = new Date(cache.timestamp);
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
            
            if (cacheTime > hourAgo && cache.stories && cache.stories.length > 0) {
                console.log('Using cached stories');
                return cache.stories;
            }
        } catch (error) {
            // Ignore cache errors and fetch fresh data
            console.log('Cache error, will fetch fresh data:', error.message);
        }

        console.log('Fetching fresh stories from Webflow...');
        console.log('Using Collection ID:', process.env.WEBFLOW_COLLECTION_ID);
        
        while (true) {
            console.log(`Fetching items with offset ${offset} and limit ${limit}...`);
            
            // Fetch stories from Webflow using v2 API
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
                const errorText = await response.text();
                throw new Error(`Webflow API error: ${response.status} ${response.statusText}\n${errorText}`);
            }

            const data = await response.json();
            console.log('Webflow API response:', {
                total: data.pagination?.total || 0,
                count: data.items?.length || 0,
                offset: data.pagination?.offset || 0,
                limit: data.pagination?.limit || 0
            });

            if (!data.items || !Array.isArray(data.items)) {
                console.error('Full API response:', JSON.stringify(data, null, 2));
                throw new Error('Invalid response from Webflow API: no items array');
            }

            if (data.items.length === 0) {
                console.log('No more items to fetch');
                break;
            }

            // Validate story structure for v2 API
            data.items.forEach((story, index) => {
                if (!story.fieldData && !story.fields) {
                    console.error('Invalid story:', JSON.stringify(story, null, 2));
                    throw new Error(`Story at index ${index} has no fieldData or fields`);
                }
            });

            allStories = allStories.concat(data.items);
            console.log(`Total stories fetched so far: ${allStories.length}`);

            // Log featured items in this batch
            const featuredItems = data.items.filter(story => story.fieldData?.featured === true);
            if (featuredItems.length > 0) {
                console.log('Featured items in this batch:', featuredItems.map(story => ({
                    title: story.fieldData['main-title'],
                    slug: story.slug,
                    featured: story.fieldData.featured
                })));
            }

            offset += limit;
            
            // If we've fetched all items (based on total count), break
            if (data.pagination?.total && offset >= data.pagination.total) {
                console.log('Reached total count, stopping pagination');
                break;
            }
        }

        if (allStories.length === 0) {
            throw new Error('No stories found in Webflow collection');
        }

        // Log all featured items
        const allFeaturedItems = allStories.filter(story => story.fieldData?.featured === true);
        console.log('All featured items:', allFeaturedItems.map(story => ({
            title: story.fieldData['main-title'],
            slug: story.slug,
            featured: story.fieldData.featured
        })));

        // Cache the stories
        try {
            const cacheDir = path.join(PROJECT_ROOT, 'cache');
            const cacheFile = path.join(cacheDir, 'stories.json');
            await fs.writeFile(cacheFile, JSON.stringify({
                timestamp: new Date(),
                stories: allStories
            }));
            console.log('Stories cached successfully');
        } catch (error) {
            console.error('Error caching stories:', error);
        }

        return allStories;
    } catch (error) {
        console.error('Error in fetchStories:', error);
        throw error;
    }
}

function filterStoriesByCategory(stories, categoryTagIds) {
    console.log('\nFiltering stories for category with tags:', categoryTagIds);
    return stories.filter(story => {
        const storyTagIds = story.fieldData.tags || [];
        const matches = categoryTagIds.some(tagId => storyTagIds.includes(tagId));
        if (matches) {
            console.log(`Story "${story.fieldData['main-title']}" matches category`);
            console.log('Story tags:', storyTagIds);
        }
        return matches;
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
        // In Vercel, write to /tmp
        if (process.env.VERCEL) {
            outputPath = path.join('/tmp', path.basename(outputPath));
        } else {
            outputPath = path.isAbsolute(outputPath) ? outputPath : path.join(PROJECT_ROOT, outputPath);
        }
        console.log('Output path:', outputPath);

        // Create output directory if it doesn't exist
        const dir = path.dirname(outputPath);
        try {
            await fs.mkdir(dir, { recursive: true });
            console.log('Created directory:', dir);
        } catch (error) {
            console.log('Directory already exists or could not be created:', dir);
        }

        // Read the template file - this should still be in the deployment
        const templatePath = path.join(process.cwd(), 'dynamic-pages', 'template.html');
        console.log('Template path:', templatePath);
        const template = await fs.readFile(templatePath, 'utf8');
        console.log('Template loaded successfully');

        const $ = cheerio.load(template, { decodeEntities: false });

        // Fetch all stories
        const stories = await fetchStories();
        console.log(`Fetched ${stories.length} stories`);

        // Define categories to display
        const categories = ['Roadside Attractions', 'Nature', 'Play'];

        // Wrap dynamically generated content within the pagewrapper div
        const $pageWrapper = $('.pagewrapper');
        if ($pageWrapper.length) {
            categories.forEach(category => {
                const categoryStories = filterStoriesByCategory(stories, CATEGORIES[category]);
                const categorySection = generateCategorySection(category, categoryStories);
                $pageWrapper.append(categorySection);
            });
        } else {
            console.warn('No pagewrapper div found to append content');
        }

        // Find the first featured story
        console.log('Looking for featured story among', stories.length, 'stories');
        console.log('Stories with featured field:', stories.filter(story => story.fieldData['featured'] !== undefined).map(story => ({
            title: story.fieldData['main-title'],
            slug: story.slug,
            featured: story.fieldData['featured']
        })));
        
        let featuredStory = stories.find(story => story.fieldData['featured'] === true);
        if (!featuredStory) {
            console.warn('No featured story found. Please set at least one story as featured in Webflow.');
            // Use the first story as a fallback
            featuredStory = stories[0];
            if (!featuredStory) {
                throw new Error('No stories available to use as featured story');
            }
            console.log('Using first story as fallback:', featuredStory.fieldData['main-title']);
        } else {
            console.log('Found featured story:', {
                title: featuredStory.fieldData['main-title'],
                slug: featuredStory.slug,
                featured: featuredStory.fieldData['featured']
            });
        }
        
        // Add featured story to used stories
        const usedStoryIds = new Set();
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

        // Update the existing Featured section with randomly selected related stories
        const $featuredContentSection = $('.content-section').first();
        if ($featuredContentSection.length && selectedStories.length > 0) {
            console.log('Updating Featured section with stories:', selectedStories.map(s => s.fieldData['main-title']));
            const $dynList = $featuredContentSection.find('.landingstorysection');
            if ($dynList.length) {
                const featuredHtml = selectedStories.map(story => generateStoryCard(story)).join('\n');
                $dynList.html(featuredHtml);
            }
        }

        // Generate new content sections, excluding used stories
        for (const category of ['Roadside Attractions', 'Nature', 'Play']) {
            console.log(`\n=== Processing ${category} section ===`);
            console.log('Category tag IDs:', CATEGORIES[category]);
            
            // Filter out already used stories before filtering by category
            const availableStories = stories.filter(story => !usedStoryIds.has(story.id));
            console.log(`${availableStories.length} stories available (not used in other sections)`);
            
            // Get stories for this category from available stories
            const categoryStories = filterStoriesByCategory(availableStories, CATEGORIES[category]);
            console.log(`Found ${categoryStories.length} stories matching ${category} tags:`);
            categoryStories.forEach(story => {
                console.log(`- ${story.fieldData['main-title']} (ID: ${story.id})`);
            });
            
            // Get random stories for this section
            const randomStories = shuffleArray([...categoryStories]).slice(0, 4);
            console.log(`\nSelected ${randomStories.length} random stories for ${category}:`);
            randomStories.forEach(story => {
                console.log(`- ${story.fieldData['main-title']} (ID: ${story.id})`);
                usedStoryIds.add(story.id);
            });
            
            // Generate and append the category section
            const categorySection = generateCategorySection(category, randomStories);
            if (categorySection) {
                $pageWrapper.append(categorySection);
            }
        }

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
