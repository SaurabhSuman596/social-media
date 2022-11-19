const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Create a Post

router.post('/', async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const post = await newPost.save();
    res.status(200).json(post);
  } catch {
    (err) => res.status(500).json(err);
  }
});

// Update a post

router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
    } else {
      res.status(403).json('You can only update your own post!');
    }
  } catch {
    (err) => res.status(500).json(err);
  }
});

// delete a post

router.delete('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);

  try {
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json('Your post has been deleted!');
    } else {
      return res.status(403).json('You are not allowed to delete this post!');
    }
  } catch {
    res.status(500).json(err);
  }
});

// Like /dislike a post

router.put('/:id/like', async (req, res) => {
  const post = await Post.findById(req.params.id);
  const user = await User.findById(req.body.userId);
  try {
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json('This post has been liked!');
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json('The post has been disliked');
    }
  } catch {
    res.status(500).json(err);
  }
});

// get a post

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch {
    res.status(500).json(err);
  }
});

// Timeline all

router.get('/timeline/all', async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({ userId: req.currentUser._id });
    const friendsPost = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendsPost));
  } catch {
    res.status(500).json(err);
  }
});

module.exports = router;
