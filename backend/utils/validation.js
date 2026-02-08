const validator = require('validator');

// Sanitize and validate user input
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return validator.escape(input.trim());
};

// Validate email
const isValidEmail = (email) => {
    return validator.isEmail(email);
};

// Validate username
const isValidUsername = (username) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
};

// Validate password strength
const isStrongPassword = (password) => {
    return validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0
    });
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
    return validator.isMongoId(id);
};

module.exports = {
    sanitizeInput,
    isValidEmail,
    isValidUsername,
    isStrongPassword,
    isValidObjectId
};
