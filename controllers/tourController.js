const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('../factories/handlerFactory');
const AppError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// upload.single('image') // 1 file
// upload.array('images', 5) // 5 files
// upload.fields() // 2 or more files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);

  next();
})

exports.aliasTopTours = (req, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
}

exports.getAllTours = factory.getAll(Tour, 'reviews');

exports.getTour = factory.getOne(Tour, 'reviews');

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

exports.getToursWithin = catchAsync(async (req, res) => {
  const {distance, latlng, unit} = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError('Please provide latitude and longitude', 400));
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});