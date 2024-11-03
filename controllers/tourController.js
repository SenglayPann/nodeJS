const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeature');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../factories/handlerFactory');

exports.aliasTopTours = (req, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
}

exports.getAllTours = catchAsync(async (req, res) => {
  // REXECUTE THE QUERY 
  const features = new APIFeatures(Tour.find().populate('reviews'), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const tours = await features.query;

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {

  const tour = await Tour.findById(req.params.id)
  .populate('reviews');

  if(!tour) {
    return next(new AppError(`No tour was found fo the id ${req.params.id}`), 404);
  };
  
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour)

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res) => {

  const stats = await Tour.aggregate([
    {
      $match:  { ratingAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty'},
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price'}
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {

  const year =  req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name'},
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0 // 1 show only id, 0 show the rest other than _id
      }
    },
    {
      $sort: { month: 1}
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan
    }
  });
});
