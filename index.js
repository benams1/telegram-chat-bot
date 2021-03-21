require('dotenv').config();
require('./models/connect');
require('./telegram')
const express = require('express');
const cors = require('cors');
const router = require('./routers/index');
const config = require('./config/index');

const app = express();

// parse json request body
app.use(express.json());

// enable cors
app.use(cors());
app.options('*', cors());

// handle all the requests in the router
app.use('/', router);

app.listen(config.port, () => {
    console.log(`App is listening on port ${config.port}`);
});
