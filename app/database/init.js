const Knex = require('knex');
const Config = require('../../config');
const config = Config.get('DB_CONFIG');

module.exports = Knex({
  client: config.DIALECT,
  connection: {
    host: config.HOST,
    user: config.USERNAME,
    password: config.PASSWORD,
    database: config.DATABASE,
    port: config.PORT,
    // debug: true,
  },
});
