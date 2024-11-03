const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .post('/signup', authController.signup)
  .post('/login', authController.login)
  .post('/forgotPassword', authController.forgotPassword)
  .patch('/resetPassword/:token', authController.resetPassword)
  .patch('/updatePassword', authController.protect, authController.updatePassword)
  .patch('/updateMe', authController.protect, userController.updateMe)
  .delete('/deleteMe', authController.protect, userController.deleteMe)
  .get('/me', authController.protect, userController.getMe, userController.getUser);
router
  .route('/')
  .get(userController.getAllUsers)
  .post(authController.protect, authController.restrictTo('admin'), userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(authController.protect, authController.restrictTo('admin'), userController.updateUser)
  .delete(authController.protect, authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
