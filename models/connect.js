const  mongoose = require('mongoose');
const config = require('../config/index');
mongoose.connect(config.mongoose.DB_URL, config.mongoose.options, () => {
  console.info('Connected to MongoDB');
})