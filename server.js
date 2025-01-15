require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();

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

// Serve static files from the root directory
app.use(express.static(__dirname));

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
        const publishedUrl = `https://explorevisitplay.webflow.io`;
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
                    title: 'Home Page',
                    description: ''
                }
            }
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
