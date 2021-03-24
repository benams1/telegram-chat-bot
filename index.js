require('dotenv').config();
require('./models/connect');
require('./telegram')
const express = require('express');
const http = require('http');
const cors = require('cors');
const router = require('./routers/index');
const { onConnect } = require('./subscriptionHandlers')
const config = require('./config/index');
const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';
const io = require('socket.io')


const app = express();
const server = http.Server(app);

const socketListener = io(server,{
    cors: {
        origin: clientURL,
        methods: ["GET", "POST"]
    },
});

socketListener.on('connection', onConnect);
// parse json request body
app.use(express.json());

// enable cors
app.use(cors());
app.options('*', cors());

// handle all the requests in the router
app.use('/', router);

server.listen(config.port, () => {
    console.log(`App is listening on port ${config.port}`);
});
