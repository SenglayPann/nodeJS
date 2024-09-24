const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'})

const databaseConfig = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

module.exports = mongoose.connect(databaseConfig, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(con => {
    // console.log(con.connections);
    console.log('DB connection successful!');
  });