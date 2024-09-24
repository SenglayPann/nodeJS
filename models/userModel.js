const mongoose = require('mongoose');
const validtor = require('validator');
// name, email, phoo, password, passwordConfirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us yuour name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    unique: true,
    lowercase: true,
    validate: [validtor.isEmail, 'Please provide a valid email adrress']
  },
  photo: {
    type: String,
    default: '',
    required: false,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password']
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;