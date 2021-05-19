const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const multipart = multer();
const cors = require('cors');
const fetch = require('node-fetch');

const config = require('./config');
const path = require('path');
const Knex = require('./app/database/init');
const routes = require('./app/api');

const app = express();
const server = require('http').Server(app);

const port = config.get('PORT');
const service = config.get('SERVICE_NAME');
const db_conf = config.get('DB_CONFIG');

const response = require('./app/helper/response');
const globalmiddleware = require('./app/middleware/global');

app.use(express.static(path.resolve('./../uploaded')));
app.use(cors({
  origin: config.get('UI_ADDRESS'),
}));

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multipart.any());

// Req Injector
/* eslint-disable no-unused-vars */
app.use(async (req, res, next) => {
  try {
    req.Knex = Knex;
    req.Config = config;
    req.Fetch = fetch;
    
    next();
  } catch (e) {
    console.log(`ERROR : Database ${db_conf.DATABASE} at ${db_conf.HOST}.`);
  }
});

// Global Middleware
// app.use(globalmiddleware);

// Routing
app.use(routes);

// Not Found handler
/* eslint-disable no-unused-vars */
app.use('*', (req, res) => response(res, 404, 'Resource not found.'));

server.listen(port, async () => {
  try {
    // eslint-disable-next-line no-console
    console.log(`Service ${service} running at port ${port}`);

    const databaseTest = await Knex.select(Knex.raw('0'));
    console.log(databaseTest.length > 0 ? `${db_conf.DIALECT} ${db_conf.DATABASE} on ${db_conf.HOST} successfully running.` : 'DATABASE ERROR');

  } catch (e) {
    console.log(e.message);
  }
});
