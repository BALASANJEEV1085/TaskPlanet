const mongoose = require('mongoose');

const ShareTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    resourceType: {
        type: String,
        enum: ['post', 'user'],
        required: true
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'resourceType'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        index: { expires: 0 } // TTL index - MongoDB will auto-delete expired tokens
    },
    accessCount: {
        type: Number,
        default: 0
    },
    maxAccess: {
        type: Number,
        default: null // null = unlimited
    },
    isActive: {
        type: Boolean,
        default: true
    },
    metadata: {
        ipAddresses: [String],
        userAgents: [String]
    }
}, {
    timestamps: true
});

// Index for efficient queries
ShareTokenSchema.index({ resourceType: 1, resourceId: 1 });
ShareTokenSchema.index({ createdBy: 1 });

module.exports = mongoose.model('ShareToken', ShareTokenSchema);
