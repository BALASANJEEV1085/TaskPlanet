const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const ShareToken = require('../models/ShareToken');
const Post = require('../models/Post');
const User = require('../models/User');

// @route   POST api/share/create
// @desc    Create a secure share token
router.post('/create', auth, async (req, res) => {
    const { resourceType, resourceId, expiresInDays, maxAccess } = req.body;

    try {
        // Validate input
        if (!resourceType || !resourceId) {
            return res.status(400).json({ msg: 'Resource type and ID are required' });
        }

        if (!['post', 'user'].includes(resourceType)) {
            return res.status(400).json({ msg: 'Invalid resource type' });
        }

        // Verify resource exists and user has permission
        let resource;
        if (resourceType === 'post') {
            resource = await Post.findById(resourceId);
            if (!resource) {
                return res.status(404).json({ msg: 'Post not found' });
            }
            // Check if user owns the post
            if (resource.user.toString() !== req.user.id) {
                return res.status(403).json({ msg: 'Not authorized to share this post' });
            }
        } else if (resourceType === 'user') {
            resource = await User.findById(resourceId);
            if (!resource) {
                return res.status(404).json({ msg: 'User not found' });
            }
            // Check if user is sharing their own profile
            if (resourceId !== req.user.id) {
                return res.status(403).json({ msg: 'Not authorized to share this profile' });
            }
        }

        // Generate secure random token
        const token = crypto.randomBytes(32).toString('hex');

        // Calculate expiration
        const expiresAt = expiresInDays
            ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

        // Create share token
        const shareToken = new ShareToken({
            token,
            resourceType,
            resourceId,
            createdBy: req.user.id,
            expiresAt,
            maxAccess: maxAccess || null
        });

        await shareToken.save();

        // Generate shareable URL
        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/share/${token}`;

        res.json({
            success: true,
            shareUrl,
            token,
            expiresAt,
            maxAccess: maxAccess || 'unlimited'
        });

    } catch (err) {
        console.error('Share token creation error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   GET api/share/:token
// @desc    Access shared resource via token
router.get('/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // Find and validate token
        const shareToken = await ShareToken.findOne({ token, isActive: true });

        if (!shareToken) {
            return res.status(404).json({ msg: 'Invalid or expired share link' });
        }

        // Check expiration
        if (shareToken.expiresAt < new Date()) {
            shareToken.isActive = false;
            await shareToken.save();
            return res.status(410).json({ msg: 'This share link has expired' });
        }

        // Check access limit
        if (shareToken.maxAccess && shareToken.accessCount >= shareToken.maxAccess) {
            shareToken.isActive = false;
            await shareToken.save();
            return res.status(410).json({ msg: 'This share link has reached its access limit' });
        }

        // Track access
        shareToken.accessCount += 1;

        // Track IP and User Agent for security audit
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');

        if (!shareToken.metadata.ipAddresses.includes(ip)) {
            shareToken.metadata.ipAddresses.push(ip);
        }
        if (!shareToken.metadata.userAgents.includes(userAgent)) {
            shareToken.metadata.userAgents.push(userAgent);
        }

        await shareToken.save();

        // Fetch and return resource
        let resource;
        if (shareToken.resourceType === 'post') {
            resource = await Post.findById(shareToken.resourceId)
                .populate('user', 'username avatar bio');

            if (!resource) {
                return res.status(404).json({ msg: 'Post not found' });
            }

            res.json({
                type: 'post',
                data: resource,
                accessCount: shareToken.accessCount,
                expiresAt: shareToken.expiresAt
            });

        } else if (shareToken.resourceType === 'user') {
            resource = await User.findById(shareToken.resourceId)
                .select('-password');

            if (!resource) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const posts = await Post.find({ user: shareToken.resourceId })
                .sort({ createdAt: -1 })
                .limit(10);

            res.json({
                type: 'user',
                data: {
                    user: resource,
                    posts
                },
                accessCount: shareToken.accessCount,
                expiresAt: shareToken.expiresAt
            });
        }

    } catch (err) {
        console.error('Share access error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   DELETE api/share/:token
// @desc    Revoke a share token
router.delete('/:token', auth, async (req, res) => {
    const { token } = req.params;

    try {
        const shareToken = await ShareToken.findOne({ token });

        if (!shareToken) {
            return res.status(404).json({ msg: 'Share token not found' });
        }

        // Verify ownership
        if (shareToken.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to revoke this share link' });
        }

        shareToken.isActive = false;
        await shareToken.save();

        res.json({ msg: 'Share link revoked successfully' });

    } catch (err) {
        console.error('Share revoke error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   GET api/share/my-shares
// @desc    Get all share tokens created by user
router.get('/user/my-shares', auth, async (req, res) => {
    try {
        const shares = await ShareToken.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 })
            .populate('resourceId');

        res.json(shares);

    } catch (err) {
        console.error('Fetch shares error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

module.exports = router;
