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
