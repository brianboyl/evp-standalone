# ExploreVisitPlay Standalone

A dynamic travel blog that showcases stories from around the world. This Node.js application integrates with Webflow CMS to create a customized homepage experience.

## Features

- Dynamic splash card featuring the latest featured story
- Smart Featured section that displays related stories based on tags
- Category-based story sections
- No duplicate stories across sections
- Responsive design for both desktop and mobile
- Integration with Webflow CMS

## Prerequisites

- Node.js (v14 or higher)
- A Webflow account with CMS collection
- Webflow API token

## Setup

1. Clone the repository:
```bash
git clone https://github.com/brianboyl/evp-standalone.git
cd evp-standalone
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on the template:
```bash
cp env.template .env
```

4. Fill in your Webflow credentials in `.env`:
```
WEBFLOW_TOKEN=your-webflow-token
SITE_ID=your-site-id
COLLECTION_ID=your-collection-id
```

## Development

Start the development server:
```bash
./restart-server.sh
```

The site will be available at `http://localhost:3000`

## Project Structure

- `server.js` - Main Express server
- `generate-dynamic-home.js` - Dynamic content generation logic
- `dynamic-pages/template.html` - Base template from Webflow
- `dynamic-pages/home.html` - Generated homepage (not in version control)
- `cache/` - Story cache directory (not in version control)

## Webflow Integration

The application fetches stories from your Webflow CMS collection and:
1. Displays a featured story as the splash card
2. Shows related stories in the Featured section based on shared tags
3. Organizes remaining stories into category sections

## Updating Styles

1. Make style changes in Webflow Designer
2. Publish the changes
3. Download the updated HTML
4. Update `dynamic-pages/template.html` with new styles (preserve dynamic section markers)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not licensed for public use.
