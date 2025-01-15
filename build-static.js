const fs = require('fs');
const path = require('path');

// Read the raw data file
const rawDataPath = process.argv[2];
if (!rawDataPath) {
    console.error('Please provide the path to the raw data JSON file');
    process.exit(1);
}

// Read and parse the raw data
const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
const { html, css, javascript } = rawData.content;

// Remove Webflow badge from HTML (more thorough regex)
let processedHtml = html.replace(/<a[^>]*?w-webflow-badge[^>]*>[\s\S]*?<\/a>/g, '')
                       .replace(/<div[^>]*?w-webflow-badge[^>]*>[\s\S]*?<\/div>/g, '');

// Remove Webflow badge related CSS
let processedCss = css.replace(/\.w-webflow-badge[\s\S]*?}/g, '')  // Remove direct badge styles
                     .replace(/\[data-brand-dark\][\s\S]*?}/g, '')  // Remove brand dark styles
                     .replace(/@media[^{]*{[^}]*\.w-webflow-badge[^}]*}/g, ''); // Remove media queries for badge

// Read the template
const templatePath = path.join(__dirname, 'static-home.html');
let template = fs.readFileSync(templatePath, 'utf8');

// Replace placeholders with actual content
template = template.replace('/* Webflow CSS and Google Fonts will be inserted here */', processedCss);
template = template.replace('// JavaScript will be inserted here', javascript);
template = template.replace('<!-- HTML content will be inserted here -->', processedHtml);

// Remove the loading div since we're embedding everything
template = template.replace('<div id="loading">Loading...</div>', '');

// Add a script to remove any dynamically added Webflow badges
const removeWebflowScript = `
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
`;

// Add the removal script just before </body>
template = template.replace('</body>', removeWebflowScript + '</body>');

// Write the final static page
const outputPath = path.join(__dirname, 'static-home-complete.html');
fs.writeFileSync(outputPath, template);

console.log(`Static page has been generated at: ${outputPath}`);
