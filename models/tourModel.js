const mongoose =  require('mongoose');
const slugify = require('slugify');
const database = require('../config/database');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      maxlength: [40, 'tour name must be have equal to or less than 40 characters.'],
      minlength: [10, 'tour name must be have equal to or more than 40 characters.'],
      // validate: {
      //   validator: validator.isAlpha,
      //   message: 'Tour name must only contain alphabet'
      // }
    },
    slug: String,
    duration: {
      type: Number,
      required: true
    },
    maxGroupSize: {
      type: Number,
      required: true
    },
    difficulty: {
      type: String,
      required: [true, 'Atour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'dufficult'],
        message: 'Difficulty is either easy, medium or difficult.'
      }
    },
    ratingAverage: {
      type: Number, 
      default: 4.5,
      min: [1, 'must greater than or equal to 1'],
      max: [5, 'must be less tha or equal to 5']
    },
    ratingQauntity: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 4.5
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price!']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on New document creation
          return val < this.price;
        },
        message: 'Discount price must be less than the actual price.'
      }
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'Atour must have a cover image']
    },
    image: [String],
    createAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }

  },
  {
    toJSON: { virtuals: true },
    toObject: { durationWeeks: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7
})

// DOCUMENT MIDDLEWRE: run before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  // this.slug = this.name;
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log('will save doc...');
//   next();
// })

// tourSchema.post('save', function(doc, next) {
//   console.log(doc)
//   next();
// })

// QUEERY MIDDLEWARE

// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(doc, next) {
  console.log(`time took for this middleware is ${ Date.now() - this.start} ms`);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true} } });
  next();
});

tourSchema
module.exports = mongoose.model('tour', tourSchema);