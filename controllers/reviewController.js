const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createReview = catchAsync(async (req, res, next) => {
  const tour = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    // tour: req.params.tourId,
    tour: req.body.tourId,
    user: req.user.id
  });

  res.status(201).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews =  await Review.find();

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});