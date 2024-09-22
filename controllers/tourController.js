const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeature');

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
}


exports.getAllTours = async (req, res) => {
  
  try {

    // REXECUTE THE QUERY 
    const features = new APIFeatures(Tour.find(), req.query)
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
};

exports.getTour = async (req, res) => {

  try {
    const tour = await Tour.findById(req.params.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: "The tour with the id doesn't exist"
    })
  }
};

exports.createTour = async (req, res) => {

  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'sucess',
      data: newTour
    })
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    })
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidator: true });  // the thrid argument will update data with the new one that returned

    res.status(201).json({
      status: 'success',
      data: tour
    });
  } catch (err){
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent'
    });
  }
};

exports.deleteTour = async (req, res) => {

  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'failed to delete the tour'
    })
  }
};


exports.getTourStats = async (req, res) => {
  try {
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
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
}

exports.getMonthlyPlan = async (req, res) => {
  try {
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
      // {
      //   $limit: 6
      // }
    ]);

    res.status(200).json({
      status: 'success',
      results: plan.length,
      data: {
        plan
      }
    });
    
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  };
}
