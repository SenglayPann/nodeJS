const mongoose =  require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);


mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(con => {
    // console.log(con.connections);
    console.log('DB connection successful!');
  });

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true
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
      required: [true, 'Atour must have a difficulty']
    },
    ratingAverage: {
      type: Number, 
      default: 4.5
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
    priceDiscount: Number,
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
    startDates: [Date]

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

tourSchema.pre('save', function(next) {
  console.log('will save doc...');
  next();
})

tourSchema.post('save', function(doc, next) {
  console.log(doc)
  next();
})

module.exports = mongoose.model('tour', tourSchema);