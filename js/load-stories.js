// Removed require statements for browser compatibility
async function fetchStories() {
    try {
        const response = await fetch('/api/stories');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching stories:', error);
        return [];
    }
}

// Function to create a card element
function createCard(story) {
    return `
        <div class="card">
            <img src="${story.image}" alt="${story.title}" class="card-image">
            <div class="card-content">
                <h2 class="card-title">${story.title}</h2>
                <p class="card-text">${story.summary}</p>
                <a href="/stories/${story.slug}" class="read-more">Read More</a>
            </div>
        </div>
    `;
}

// Function to update the page with stories
async function updateStoriesGrid() {
    const stories = await fetchStories();
    const gridContainer = document.querySelector('.cards-grid');
    if (gridContainer) {
        gridContainer.innerHTML = stories.map(story => createCard(story)).join('');
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', updateStoriesGrid);
