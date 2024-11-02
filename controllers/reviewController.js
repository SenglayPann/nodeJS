const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../factories/handlerFactory');

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tourId = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const tour = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
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
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews =  await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError(`No review was found for id ${req.params.id}`, 404));
  }     

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});


exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!review) {
    return next(new AppError(`No review was found for id ${req.params.id}`, 404));
  }     

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});
