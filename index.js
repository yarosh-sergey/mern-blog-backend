import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'fs';
import {
  registerValidaton,
  loginValidaton,
  postCreateValidaton,
  commentCreateValidation,
} from './validations/validations.js';
import {
  UserController,
  PostController,
  CommentController,
} from './controllers/index.js';
import { handleValidationsErrors, checkAuth } from './utils/index.js';
import cors from 'cors';
import timeout from 'connect-timeout';
import dotenv from 'dotenv'

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}

app.use(timeout('15s'))
app.use(express.json());
app.use(haltOnTimedout)
app.use(cors());
app.use(haltOnTimedout)
app.use('/uploads', express.static('uploads'));
app.use(haltOnTimedout)

app.post(
  '/auth/login',
  loginValidaton,
  handleValidationsErrors,
  UserController.login
);
app.post(
  '/auth/register',
  registerValidaton,
  handleValidationsErrors,
  UserController.register
);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/tags', PostController.getLastTags);
app.get('/tags/:tag', PostController.getAllWithTag);
app.get('/posts', PostController.getAll);
app.post(
  '/posts',
  checkAuth,
  postCreateValidaton,
  handleValidationsErrors,
  PostController.create
);
app.get('/posts/:id', PostController.getOne);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidaton,
  handleValidationsErrors,
  PostController.update
);
app.get('/posts/comments/:id', PostController.getPostComments);

app.post(
  '/comments',
  checkAuth,
  commentCreateValidation,
  handleValidationsErrors,
  CommentController.create
);
app.get('/comments', CommentController.getLastComments);

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log('Server ok');
});
