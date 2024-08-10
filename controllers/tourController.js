// const fs = require('fs');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const { error } = require('console');
const Tour = require('../models/tourModel');

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
}


exports.getAllTours = async (req, res) => {
  // console.log(req.requestTime);

  // res.status(200).json({
  //   status: 'success',
  //   requestedAt: req.requestTime,
  //   results: tours.length,
  //   data: {
  //     tours
  //   }
  // });
  
  
  try {
    // BUILD QUERY
    // 1A) FILTERING
    const queryObj = {...req.query};
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    
    // 1B) ANVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Tour.find(JSON.parse(queryStr));

    // 2) SORTING
    if (req.query.sort) {
      console.log(req.query);
      query = query.sort(req.query.sort);
    } else {
      query = query.sort('createAt');
    }

    // 3) FIELDS LIMITING
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      console.log(fields)
      query = query.select(fields);
    }

    // 4) PAGINATION
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const tourCount = await Tour.countDocuments();
      if ( skip >= tourCount) throw new Error('This page is not found!');
    }

    // REXECUTE THE QUERY 
    const tours = await query

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
  // console.log(req.params);
  // const id = req.params.id * 1;

  // const tour = tours.find(el => el.id === id);

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour
  //   }
  // });

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
  // console.log(req.body);

  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);

  // tours.push(newTour);

  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   err => {
  //     res.status(201).json({
  //       status: 'success',
  //       data: {
  //         tour: newTour
  //       }
  //     });
  //   }
  // );

  
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
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour: '<Updated tour here...>'
  //   }
  // });
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
  // res.status(204).json({
  //   status: 'success',
  //   data: null
  // });

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
