const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('Environment Check:');
if (process.env.MONGODB_URI) {
    console.log('MONGODB_URI is set.');
} else {
    console.error('ERROR: MONGODB_URI is NOT set in .env file!');
    process.exit(1);
}

console.log('Attempting MongoDB connection...');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB!');
        process.exit(0);
    })
    .catch(err => {
        console.error('ERROR: Failed to connect to MongoDB:', err.message);
        // Sometimes errors have more details
        if (err.cause) console.error('Cause:', err.cause);
        process.exit(1);
    });
