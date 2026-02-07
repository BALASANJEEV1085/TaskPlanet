const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../config/cloudinary');
const Post = require('../models/Post');
const User = require('../models/User');

// @route   POST api/posts
// @desc    Create a post
router.post('/', [auth, upload.single('image')], async (req, res) => {
    try {
        const { text } = req.body;
        const imageUrl = req.file ? req.file.path : null;

        if (!text && !imageUrl) {
            return res.status(400).json({ msg: 'Please provide text or an image' });
        }

        const newPost = new Post({
            text,
            image: imageUrl,
            user: req.user.id,
            username: req.user.username
        });

        const post = await newPost.save();
        await post.populate('user', 'username avatar');
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/posts
// @desc    Get all posts
router.get('/', async (req, res) => {
    try {
        const { sort } = req.query;
        let posts;

        if (sort === 'liked') {
            posts = await Post.aggregate([
                {
                    $addFields: { likesCount: { $size: "$likes" } }
                },
                { $sort: { likesCount: -1, createdAt: -1 } }
            ]);
            await Post.populate(posts, { path: 'user', select: 'username avatar' });
        } else if (sort === 'commented') {
            posts = await Post.aggregate([
                {
                    $addFields: { commentsCount: { $size: "$comments" } }
                },
                { $sort: { commentsCount: -1, createdAt: -1 } }
            ]);
            await Post.populate(posts, { path: 'user', select: 'username avatar' });
        } else {
            posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'username avatar');
        }

        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/posts/search
// @desc    Search posts and users
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const posts = await Post.find({
            $or: [
                { text: { $regex: q, $options: 'i' } },
                { username: { $regex: q, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 }).populate('user', 'username avatar');

        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/posts/:id
// @desc    Get post by ID
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'username avatar')
            .populate('comments.user', 'username avatar')
            .populate('comments.replies.user', 'username avatar'); // Populate reply users
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Post not found' });
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Check user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await post.deleteOne();

        res.json({ msg: 'Post removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Post not found' });
        res.status(500).send('Server error');
    }
});

// @route   PUT api/posts/like/:id
// @desc    Like or Unlike a post
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const likeIndex = post.likes.findIndex(like => like.user.toString() === req.user.id);

        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.unshift({ user: req.user.id, username: req.user.username });
        }

        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
router.post('/comment/:id', auth, async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const newComment = {
            text,
            user: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar,
            createdAt: new Date()
        };

        post.comments.unshift(newComment);

        await post.save();
        // Populate user details for the response
        await post.populate('comments.user', 'username avatar');
        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/posts/comment/:id/:comment_id/like
// @desc    Like/Unlike a comment
router.put('/comment/:id/:comment_id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Find comment
        const comment = post.comments.find(
            (comment) => comment.id === req.params.comment_id
        );

        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        // Check if already liked
        const likeIndex = comment.likes.findIndex(
            (userId) => userId.toString() === req.user.id
        );

        if (likeIndex > -1) {
            comment.likes.splice(likeIndex, 1);
        } else {
            comment.likes.push(req.user.id);
        }

        await post.save();

        // Populate before sending back
        await post.populate('comments.user', 'username avatar');
        await post.populate('comments.replies.user', 'username avatar');

        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/posts/comment/:id/:comment_id/reply
// @desc    Reply to a comment
router.post('/comment/:id/:comment_id/reply', auth, async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const comment = post.comments.find(
            (comment) => comment.id === req.params.comment_id
        );

        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        const newReply = {
            user: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar,
            text,
            createdAt: new Date()
        };

        comment.replies.push(newReply);

        await post.save();

        // Populate
        await post.populate('comments.user', 'username avatar');
        await post.populate('comments.replies.user', 'username avatar');

        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
