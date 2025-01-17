require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fetch = require('node-fetch');
const generateDynamicHome = require('./generate-dynamic-home');

const app = express();
const port = process.env.PORT || 3000;

// Add this line to handle JSON requests
app.use(express.json({ limit: '50mb' }));

// Test endpoint to verify server is running latest code
app.get('/api/test', (req, res) => {
    console.log('Test endpoint hit at:', new Date().toISOString());
    res.json({ 
        message: 'Server is running latest code',
        env: {
            siteId: process.env.WEBFLOW_SITE_ID ? 'Set' : 'Not set',
            apiToken: process.env.WEBFLOW_API_TOKEN ? 'Set' : 'Not set'
        }
    });
});

// API endpoint to fetch site pages
app.get('/api/pages', async (req, res) => {
    try {
        const response = await fetch(
            `https://api.webflow.com/v2/sites/${process.env.WEBFLOW_SITE_ID}/pages`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                    'accept-version': '2.0.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch pages: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Found ${data.pages.length} pages`);
        
        res.json({ 
            success: true, 
            pages: data.pages.map(page => ({
                id: page.id,
                title: page.title || page.name,
                slug: page.slug,
                displayName: page.title || page.name || page.slug || '(root)'
            }))
        });
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/pages/:id/content', async (req, res) => {
    try {
        const pageId = req.params.id;
        console.log('Fetching content for page:', pageId);

        // First get the pages list to find the slug
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
        const page = pagesData.pages.find(p => p.id === pageId);
        
        if (!page) {
            throw new Error(`Page not found with ID: ${pageId}`);
        }

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
        
        const responseData = {
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

        res.json(responseData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

function generateStaticPage(data) {
    const { html, css, javascript } = data.content;

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
    <title>${data.content.meta.title || 'Static Page'}</title>
    <meta content="${data.content.meta.description || ''}" name="description"/>
    
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

app.post('/api/generate-static', async (req, res) => {
    try {
        console.log('Received request to generate static page');
        const pageData = req.body;
        
        if (!pageData || !pageData.content) {
            console.error('Invalid page data received:', pageData);
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid page data: missing content' 
            });
        }

        console.log('Page data content keys:', Object.keys(pageData.content));
        const staticHtml = generateStaticPage(pageData);
        console.log('Static HTML generated successfully, length:', staticHtml.length);
        
        res.json({ success: true, html: staticHtml });
    } catch (error) {
        console.error('Error generating static page:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: error.stack 
        });
    }
});

// Serve dynamic home page at /
app.get('/', async (req, res) => {
    try {
        console.log('Generating fresh home page...');
        
        // Clear the require cache for generateDynamicHome
        delete require.cache[require.resolve('./generate-dynamic-home')];
        const generateDynamicHome = require('./generate-dynamic-home');
        
        // Generate a unique filename for this request
        const timestamp = Date.now();
        const tempFile = path.join('dynamic-pages', `home-${timestamp}.html`);
        
        // Generate a fresh page
        await generateDynamicHome(tempFile);
        
        // Read and send the page
        const html = await fs.readFile(tempFile, 'utf8');
        
        // Set strong cache-busting headers
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
            'ETag': false,
            'Last-Modified': (new Date()).toUTCString()
        });
        
        // Send the page
        res.send(html);
        console.log('Sent fresh home page');
        
        // Clean up the temporary file
        await fs.unlink(tempFile).catch(console.error);
    } catch (error) {
        console.error('Error serving dynamic home:', error);
        res.status(500).send('Error generating page');
    }
});

// Redirect /dynamic-pages/home.html to / to ensure users get dynamic content
app.get('/dynamic-pages/home.html', (req, res) => {
    console.log('Redirecting from static to dynamic page');
    res.redirect('/');
});

// Serve static files from the root directory, excluding index.html
app.use(express.static('.', {
    index: false // Prevent serving index.html at /
}));

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Visit http://localhost:3000 to see dynamic content');
});
