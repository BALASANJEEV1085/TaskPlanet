const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const upload = require('../config/cloudinary');

// @route   PUT api/users/profile
// @desc    Update user profile
router.put('/profile', [auth, upload.single('profilePicture')], async (req, res) => {
    const { username, bio, avatar } = req.body;
    console.log('Profile update request:', { username, bio, avatar, hasFile: !!req.file, userId: req.user.id });

    try {
        let user = await User.findById(req.user.id);
        if (!user) {
            console.log('User not found:', req.user.id);
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if username is already taken by another user
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) return res.status(400).json({ msg: 'Username already taken' });
            user.username = username;
        }

        if (bio !== undefined) user.bio = bio;

        // Handle profile picture upload
        if (req.file) {
            console.log('Uploading profile picture:', req.file.path);
            user.avatar = req.file.path; // Cloudinary URL
        } else if (avatar !== undefined) {
            user.avatar = avatar; // Avatar seed for dicebear
        }

        await user.save();
        console.log('Profile updated successfully for user:', user.username);

        const updatedUser = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
            followers: user.followers,
            following: user.following
        };

        res.json(updatedUser);
    } catch (err) {
        console.error('Profile update error:', err.message, err.stack);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   POST api/users/follow/:id
// @desc    Follow/Unfollow a user
router.post('/follow/:id', auth, async (req, res) => {
    console.log('Follow request:', { currentUserId: req.user.id, targetUserId: req.params.id });

    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ msg: 'You cannot follow yourself' });
        }

        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow) {
            console.log('Target user not found:', req.params.id);
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!currentUser) {
            console.log('Current user not found:', req.user.id);
            return res.status(404).json({ msg: 'Current user not found' });
        }

        // Check if already following
        const isFollowing = currentUser.following.some(id => id.toString() === req.params.id);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user.id);
            console.log(`User ${currentUser.username} unfollowed ${userToFollow.username}`);
        } else {
            // Follow
            currentUser.following.push(req.params.id);
            userToFollow.followers.push(req.user.id);
            console.log(`User ${currentUser.username} followed ${userToFollow.username}`);
        }

        await currentUser.save();
        await userToFollow.save();

        res.json({
            following: currentUser.following,
            followers: userToFollow.followers,
            isFollowing: !isFollowing
        });
    } catch (err) {
        console.error('Follow error:', err.message, err.stack);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   GET api/users/:id/followers
// @desc    Get user followers
router.get('/:id/followers', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('followers', 'username avatar bio');
        res.json(user.followers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/users/:id/following
// @desc    Get user following
router.get('/:id/following', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('following', 'username avatar bio');
        res.json(user.following);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/users/:id
// @desc    Get user profile by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const posts = await Post.find({ user: req.params.id }).sort({ createdAt: -1 });
        res.json({ user, posts });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
