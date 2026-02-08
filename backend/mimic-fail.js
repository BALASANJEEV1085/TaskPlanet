const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./models/Post');
const User = require('./models/User'); // Required for populate
const upload = require('./config/cloudinary'); // Test cloudinary config

dotenv.config();

async function run() {
    console.log('Connecting to MongoDB...');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');
    } catch (err) {
        console.error('Connection failed:', err);
        return;
    }

    console.log('Running Post query...');
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'username avatar');
        console.log(`Success! Found ${posts.length} posts.`);
        // console.log(JSON.stringify(posts, null, 2));
    } catch (err) {
        console.error('Query failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
