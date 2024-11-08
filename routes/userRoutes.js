const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const AppError = require('../utils/appError');
const multer = require('multer');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, 'user-' + req.user.id + '-' + Date.now() + '.' + ext);
//   }
// });

const multerStorage = multer.memoryStorage(); // image will be stored as buffer

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image! Please provide an image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

const router = express.Router();

router
  .post('/signup', authController.signup)
  .post('/login', authController.login)
  .get('/logout', authController.logout)
  .post('/forgotPassword', authController.forgotPassword)
  .patch('/resetPassword/:token', authController.resetPassword)
  .patch(
    '/updateMyPassword',
    authController.protect,
    authController.updatePassword
  )
  .patch(
    '/updateMe',
    authController.protect,
    upload.single('photo'),
    userController.resizePhoto,
    userController.updateMe
  )
  .delete('/deleteMe', authController.protect, userController.deleteMe)
  .get(
    '/me',
    authController.protect,
    userController.getMe,
    userController.getUser
  );
router
  .route('/')
  .get(userController.getAllUsers)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    userController.createUser
  );

router
  .route('/:id')
  .get(userController.getUser)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    userController.updateUser
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  );

module.exports = router;
