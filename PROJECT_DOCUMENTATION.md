# Project Documentation for ExploreVisitPlay

## Overview

ExploreVisitPlay is a dynamic travel blog that integrates with Webflow CMS to display stories on the homepage. The project is built using Node.js and Express, with a focus on dynamically generating content based on Webflow data.

## Key Features

- **Dynamic Featured Section**: Displays stories based on tags from the splash card, ensuring no story appears more than once on the page.
- **Webflow API Integration**: Fetches stories from the Webflow collection using API v2.
- **Environment Variables**: Securely manages API tokens and site configuration through environment variables.
- **Vercel Deployment**: Configured for deployment on Vercel, using `/tmp` for file operations in a serverless environment.

## Setup Instructions

1. **Environment Variables**:
   - `WEBFLOW_API_TOKEN`: Your Webflow API token.
   - `WEBFLOW_SITE_ID`: Your Webflow site ID.
   - `WEBFLOW_COLLECTION_ID`: Your Webflow collection ID.

2. **Installation**:
   - Ensure Node.js is installed on your system.
   - Install necessary packages:
     ```bash
     npm install dotenv node-fetch cheerio
     ```

3. **Running Locally**:
   ```bash
   npm start
   ```

4. **Deployment**:
   - Ensure all environment variables are set in Vercel.
   - Deploy using Vercel's CLI or web interface.

## Development Process

### Initial Setup
1. **Project Initialization**: Set up a Node.js and Express server to serve dynamic content.
2. **Webflow Integration**: Integrated Webflow API to fetch stories, setting up necessary environment variables.

### Webflow Code Extraction Process

1. **Understanding Webflow Structure**:
   - Explored Webflow's CMS to understand collections, fields, and items.
   - Identified key data points needed for the blog, such as titles, images, and tags.

2. **API Key Setup**:
   - Generated a Webflow API key and stored it securely using the `dotenv` package.
   - Configured environment variables (`WEBFLOW_API_TOKEN`, `WEBFLOW_SITE_ID`, `WEBFLOW_COLLECTION_ID`) for secure access.

3. **API Endpoint Identification**:
   - Used Webflow's API documentation to identify endpoints for fetching collections and items.
   - Focused on the `/collections/{collection_id}/items` endpoint for retrieving story data.

4. **Fetching Collections**:
   - Implemented a script (`get-collections.js`) to fetch and list all collections using the Webflow API.
   - Utilized the `node-fetch` package to make HTTP requests to the API.

5. **Item Retrieval**:
   - Developed a tool (`get-cms-items.js`) to fetch specific items from collections.
   - Used the `cheerio` package to parse and manipulate HTML content for dynamic page generation.

6. **Field Mapping**:
   - Mapped Webflow fields to local data structures, ensuring consistency in data handling.
   - Created utility functions to transform API responses into usable formats.

7. **Data Normalization**:
   - Normalized data to handle variations in API responses, such as missing fields or different data types.
   - Implemented checks to ensure all required fields were present before processing.

8. **Dynamic Content Generation**:
   - Integrated extracted data into the application using `generate-dynamic-home.js`.
   - Dynamically generated HTML content based on Webflow data, ensuring no duplicate stories.

9. **Testing and Validation**:
   - Tested the integration to ensure correct data display and functionality.
   - Used logging and error messages to diagnose and fix issues during development.

10. **Error Handling**:
    - Implemented comprehensive error handling for API calls and data processing.
    - Added logging to capture detailed error messages and API responses.

11. **Version Compatibility**:
    - Addressed API versioning issues by switching to Webflow API v2.
    - Updated code to handle changes in the API response structure.

## File Descriptions

### Root Directory

- **.env**: Contains environment variables for the project. Ensure sensitive information like API tokens are stored here.
- **.gitignore**: Specifies files and directories to be ignored by Git.
- **PROJECT_DOCUMENTATION.md**: Contains comprehensive documentation for the project.
- **README.md**: Provides a brief overview and setup instructions for the project.
- **about.html, article.html, home-test.html, etc.**: HTML files likely used for testing or static content.
- **build-static.js**: Script for building static versions of pages.
- **check-collection.js, check-site.js**: Scripts for validating Webflow collections and site configurations.
- **config.js**: Configuration settings for the project.
- **env.template**: Template for the .env file, showing required environment variables.
- **example-usage.js**: Example script demonstrating how to use certain project functionalities.
- **fetch-stories.js**: Script for fetching stories from Webflow.
- **generate-all-static.js**: Generates static versions of all pages.
- **generate-dynamic-home.js**: Generates a dynamic home page using Webflow data.
- **get-cms-items.js, get-collections.js**: Scripts for retrieving CMS items and collections from Webflow.
- **get-sites.js, get-staging-info.js**: Scripts for retrieving site information and staging details.
- **index.html.old**: An older version of the index page, kept for reference.
- **js/**: Directory containing JavaScript files for client-side functionality.
- **package.json, package-lock.json**: Define project dependencies and metadata.
- **page-content-viewer.html**: Extracts and displays content from a specified Webflow project. Allows users to generate static pages and save views.
- **pages-viewer.html**: HTML file for viewing pages.
- **restart-server.sh**: Script to restart the server.
- **server.js**: Main server file for handling requests and responses.
- **styles.css**: Stylesheet for the project.
- **test-api.sh**: Shell script for testing API endpoints.
- **update-links.js**: Script for updating links within the project.
- **vercel.json**: Configuration file for deploying on Vercel.
- **webflow-api-test.js**: Script for testing Webflow API connectivity.
- **webpack.config.js**: Configuration for Webpack, if used for bundling assets.

### `dynamic-pages` Directory

- **home.html**: The dynamically generated home page.
- **template.html**: Template used for generating the dynamic home page.

These descriptions should give you a clear understanding of the project's components and their purposes.

## Tools and Utilities

### `get-collections.js`
- **Purpose**: Fetches and lists all collections from Webflow.
- **Usage**: `node get-collections.js`

### `get-cms-items.js`
- **Purpose**: Retrieves specific items from a given Webflow collection.
- **Usage**: `node get-cms-items.js <collection_id>`

### `generate-dynamic-home.js`
- **Purpose**: Generates a dynamic home page using data fetched from Webflow.
- **Usage**: `node generate-dynamic-home.js`

### `webflow-api-test.js`
- **Purpose**: Tests API connectivity and responses from Webflow.
- **Usage**: `node webflow-api-test.js`

### `page-content-viewer.html`
- **Purpose**: Extracts and displays content from a specified Webflow project. Allows users to generate static pages and save views.
- **Usage**:
  1. **Load the Viewer**: Open `page-content-viewer.html` in a web browser.
  2. **Extract Pages**: Ensure your `.env` file is configured with the correct Webflow API keys to extract pages.
  3. **Generate Static Pages**: Click the "Generate Static Page" button to create and save static versions of the displayed pages.
  4. **Save Views**: Use the "Save Current View to File" button to save the current view to a file for future reference.

### Cache Management
- **Implementation**: Integrated within `generate-dynamic-home.js`.
- **Instructions**: Caching is automatic. Cached data is stored in the `/tmp` directory in Vercel or the `cache` directory locally.

## Lessons Learned

- **API Versioning**: Ensure compatibility with the correct Webflow API version.
- **File System Constraints**: Adapt to Vercel's read-only file system by using `/tmp` for temporary file storage.
- **Dynamic Content**: Successfully implemented dynamic content generation based on CMS data.

## Future Enhancements

- Consider adding more categories and tags for better content organization.
- Explore additional features such as user comments or social media integration.
