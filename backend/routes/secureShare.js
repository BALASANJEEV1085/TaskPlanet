const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const { generateSecureHash, parseSecureHash } = require('../utils/encryption');

// @route   POST api/secure-share/post
// @desc    Generate encrypted share link for post
router.post('/post', auth, async (req, res) => {
    const { postId } = req.body;

    try {
        // Verify post exists and user owns it
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to share this post' });
        }

        // Generate secure encrypted hash
        const hash = generateSecureHash(postId, 'post');
        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/s/${hash}`;

        res.json({
            success: true,
            shareUrl,
            hash
        });

    } catch (err) {
        console.error('Secure share error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   POST api/secure-share/user
// @desc    Generate encrypted share link for user profile
router.post('/user', auth, async (req, res) => {
    const { userId } = req.body;

    try {
        // Verify user exists and is sharing their own profile
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (userId !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to share this profile' });
        }

        // Generate secure encrypted hash
        const hash = generateSecureHash(userId, 'user');
        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/s/${hash}`;

        res.json({
            success: true,
            shareUrl,
            hash
        });

    } catch (err) {
        console.error('Secure share error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   GET api/secure-share/:hash
// @desc    Access shared resource via encrypted hash
router.get('/:hash', async (req, res) => {
    const { hash } = req.params;

    try {
        // Decrypt and parse the hash
        const { resourceType, resourceId } = parseSecureHash(hash);

        // Fetch and return resource based on type
        if (resourceType === 'post') {
            const post = await Post.findById(resourceId)
                .populate('user', 'username avatar bio');

            if (!post) {
                return res.status(404).json({ msg: 'Post not found or has been deleted' });
            }

            res.json({
                type: 'post',
                data: post
            });

        } else if (resourceType === 'user') {
            const user = await User.findById(resourceId)
                .select('-password');

            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const posts = await Post.find({ user: resourceId })
                .populate('user', 'username avatar')
                .sort({ createdAt: -1 })
                .limit(10);

            res.json({
                type: 'user',
                data: {
                    user,
                    posts
                }
            });
        } else {
            return res.status(400).json({ msg: 'Invalid resource type' });
        }

    } catch (err) {
        console.error('Secure access error:', err);

        // Don't reveal specific error details to prevent information leakage
        if (err.message.includes('Invalid') || err.message.includes('corrupted')) {
            return res.status(404).json({ msg: 'Invalid or expired share link' });
        }

        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
