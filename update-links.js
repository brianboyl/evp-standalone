const fs = require('fs').promises;
const cheerio = require('cheerio');
const path = require('path');

// List of main pages that we have generated
const mainPages = new Set([
    'index.html',
    'art-and-design.html',
    'nature.html',
    'outdoor-activities.html',
    'stories.html',
    'articles.html',
    'about.html',
    'photos.html',
    'stories.html',
    'search.html',
    'design-system.html',
    'alphabetical.html',
    '404.html',
    '401.html',
    'landing-static.html'
]);

async function updateLinks() {
    const staticPagesDir = 'static-pages';
    const files = await fs.readdir(staticPagesDir);

    for (const file of files) {
        if (!file.endsWith('.html')) continue;

        console.log(`Processing ${file}...`);
        const filePath = path.join(staticPagesDir, file);
        let content = await fs.readFile(filePath, 'utf8');
        
        // Parse the HTML without modifying its structure
        const $ = cheerio.load(content, { 
            decodeEntities: false,
            _useHtmlParser2: true,
            xmlMode: true
        });

        // Update links in the document
        $('a').each((i, elem) => {
            const href = $(elem).attr('href');
            if (!href) return;

            // Skip if not a page link
            if (href.startsWith('http') || href.startsWith('#') || 
                href.includes('.css') || href.includes('.js') || 
                href.includes('.png') || href.includes('.jpg') ||
                href.includes('.svg')) {
                return;
            }

            // Handle root URL
            if (href === '/') {
                $(elem).attr('href', 'index.html');
                return;
            }

            // Remove any query parameters and leading slash
            const urlPath = href.split('?')[0].replace(/^\//, '');
            
            // Check if it's a main page
            const targetFile = urlPath + '.html';
            if (mainPages.has(targetFile)) {
                $(elem).attr('href', targetFile);
            } else {
                // Create a placeholder link for detail pages
                $(elem).attr('href', '#');
                $(elem).attr('title', `Placeholder for: ${urlPath}`);
                const originalText = $(elem).text();
                if (!originalText.endsWith('*')) {
                    $(elem).text(originalText + ' *');
                }
            }
        });

        // Add notice if not already present
        if (!$('body').html().includes('Links marked with an asterisk')) {
            const notice = $('<div style="background-color: #f0f0f0; padding: 10px; margin: 10px 0; border: 1px solid #ccc;">Note: Links marked with an asterisk (*) are placeholders for detail pages that haven\'t been generated yet.</div>');
            $('body').prepend(notice);
        }

        // Save while preserving the exact structure
        await fs.writeFile(filePath, $.html({ xmlMode: true }));
        console.log(`Updated ${file}`);
    }

    console.log('All files have been updated!');
}

updateLinks().catch(console.error);
