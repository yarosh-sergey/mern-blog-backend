import CommentModel from '../models/Comment.js';
import PostModel from '../models/Post.js';

export const create = async (req, res) => {
  try {
    const doc = new CommentModel({
      text: req.body.text,
      user: req.body.userId,
    });
    await doc.save();
    const comment = await CommentModel.findById(doc._id).populate('user');

    try {
      await PostModel.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment._id },
      });
    } catch (err) {
      console.log(err);
    }

    res.json(comment);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to create comment!',
    });
  }
};

export const getLastComments = async (req, res) => {
  try {
    const comments = await CommentModel.find().populate('user').limit(5).exec();

    // const tags = posts
    //   .map((obj) => obj.tags)
    //   .flat()
    //   .slice(0, 5);

    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to create comment!',
    });
  }
};
