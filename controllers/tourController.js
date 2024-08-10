const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeature')

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
}


exports.getAllTours = async (req, res) => {
  
  try {
    // BUILD QUERY
    // // 1A) FILTERING
    // const queryObj = {...req.query};
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach(el => delete queryObj[el]);
    
    // // 1B) ANVANCED FILTERING
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    // let query = Tour.find(JSON.parse(queryStr));

    // // 2) SORTING
    // if (req.query.sort) {
    //   console.log(req.query);
    //   query = query.sort(req.query.sort);
    // } else {
    //   query = query.sort('createAt');
    // }

    // // 3) FIELDS LIMITING
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // }

    // // 4) PAGINATION
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const tourCount = await Tour.countDocuments();
    //   if ( skip >= tourCount) throw new Error('This page is not found!');
    // }

    // REXECUTE THE QUERY 
    const features = new APIFeatures(Tour.find(), req.query);

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
      message: 'Invalid data sent'
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
