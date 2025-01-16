const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

async function generateStaticPage(pageData) {
    const { html, css, javascript } = pageData.content;

    // Remove Webflow badge from HTML
    let processedHtml = html.replace(/<a[^>]*?w-webflow-badge[^>]*>[\s\S]*?<\/a>/g, '')
                           .replace(/<div[^>]*?w-webflow-badge[^>]*>[\s\S]*?<\/div>/g, '');

    // Remove Webflow badge related CSS
    let processedCss = css.replace(/\.w-webflow-badge[\s\S]*?}/g, '')
                         .replace(/\[data-brand-dark\][\s\S]*?}/g, '')
                         .replace(/@media[^{]*{[^}]*\.w-webflow-badge[^}]*}/g, '');

    // Create the static page template
    let template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>${pageData.content.meta.title || 'Static Page'}</title>
    <meta content="${pageData.content.meta.description || ''}" name="description"/>
    
    <!-- Embedded CSS -->
    <style>
        ${processedCss}
    </style>

    <!-- Embedded JavaScript -->
    <script>
        ${javascript}
    </script>
</head>
<body>
    ${processedHtml}
    <script>
        // Remove any dynamically added Webflow badges
        function removeWebflowBadge() {
            const badges = document.querySelectorAll('.w-webflow-badge, [data-brand-dark]');
            badges.forEach(badge => badge.remove());
        }
        
        // Run on page load
        removeWebflowBadge();
        
        // Run after a short delay to catch any dynamically added badges
        setTimeout(removeWebflowBadge, 1000);
        
        // Run when DOM changes
        const observer = new MutationObserver(removeWebflowBadge);
        observer.observe(document.body, { childList: true, subtree: true });
    </script>
</body>
</html>`;

    return template;
}

async function getPageContent(page) {
    try {
        // Get site's CSS and JS
        const siteResponse = await fetch(
            `https://api.webflow.com/v2/sites/${process.env.WEBFLOW_SITE_ID}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                    'accept-version': '2.0.0'
                }
            }
        );

        if (!siteResponse.ok) {
            throw new Error(`Failed to fetch site data: ${siteResponse.status}`);
        }

        const siteData = await siteResponse.json();
        console.log('Successfully fetched site data');

        // Get the published URL for this page
        const pagePath = page.slug ? `/${page.slug}` : '';
        const publishedUrl = `https://explorevisitplay.webflow.io${pagePath}`;
        console.log('Fetching content from URL:', publishedUrl);
        
        const contentResponse = await fetch(publishedUrl);
        if (!contentResponse.ok) {
            throw new Error(`Failed to fetch page content: ${contentResponse.status}`);
        }
        
        const htmlContent = await contentResponse.text();
        console.log('Successfully fetched HTML content');
        
        return {
            success: true,
            content: {
                html: htmlContent,
                css: siteData.customCss || '',
                javascript: siteData.customJs || '',
                meta: {
                    title: page.title || page.name || '',
                    description: page.description || ''
                }
            }
        };
    } catch (error) {
        console.error(`Error fetching content for page ${page.slug}:`, error);
        return null;
    }
}

async function generateAllStaticPages() {
    try {
        console.log('Starting static page generation...');
        
        // Create static-pages directory if it doesn't exist
        await fs.mkdir('static-pages', { recursive: true });
        
        // Get list of all pages
        const pagesResponse = await fetch(
            `https://api.webflow.com/v2/sites/${process.env.WEBFLOW_SITE_ID}/pages`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                    'accept-version': '2.0.0'
                }
            }
        );

        if (!pagesResponse.ok) {
            throw new Error(`Failed to fetch pages: ${pagesResponse.status}`);
        }

        const pagesData = await pagesResponse.json();
        const pages = pagesData.pages;
        
        console.log(`Found ${pages.length} pages to process`);
        
        // Process each page
        for (const page of pages) {
            console.log(`\nProcessing page: ${page.title || page.name || page.slug}`);
            
            // Get page content
            const pageData = await getPageContent(page);
            if (!pageData) {
                console.log(`Skipping page ${page.slug} due to error`);
                continue;
            }
            
            // Generate static HTML
            const staticHtml = await generateStaticPage(pageData);
            
            // Create filename
            const filename = page.slug ? `${page.slug}.html` : 'index.html';
            const filepath = path.join('static-pages', filename);
            
            // Save file
            await fs.writeFile(filepath, staticHtml);
            console.log(`Generated static page: ${filepath}`);
        }
        
        console.log('\nStatic page generation complete!');
        console.log('Files are located in the static-pages directory');
    } catch (error) {
        console.error('Error generating static pages:', error);
    }
}

// Run the script
generateAllStaticPages();
