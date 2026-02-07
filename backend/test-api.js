// Test file to verify API endpoints
// Run this with: node test-api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPIs() {
    console.log('Testing API Endpoints...\n');

    // Test 1: Health check
    try {
        const res = await axios.get(`${BASE_URL}/posts`);
        console.log('✓ GET /api/posts - Working');
    } catch (err) {
        console.log('✗ GET /api/posts - Failed:', err.message);
    }

    // Test 2: Search route
    try {
        const res = await axios.get(`${BASE_URL}/posts/search?q=test`);
        console.log('✓ GET /api/posts/search - Working');
    } catch (err) {
        console.log('✗ GET /api/posts/search - Failed:', err.message);
    }

    // Test 3: Get specific post (will fail if no posts exist)
    try {
        const posts = await axios.get(`${BASE_URL}/posts`);
        if (posts.data.length > 0) {
            const postId = posts.data[0]._id;
            const res = await axios.get(`${BASE_URL}/posts/${postId}`);
            console.log('✓ GET /api/posts/:id - Working');
        } else {
            console.log('⚠ GET /api/posts/:id - No posts to test');
        }
    } catch (err) {
        console.log('✗ GET /api/posts/:id - Failed:', err.message);
    }
}

testAPIs();
