require('dotenv').config();
const nconf = require('nconf');
const packageJson = require('./package.json');

const config = {
  ENV: '__ENV__',
  SERVICE_NAME: '__SERVICE_NAME__',
  PORT: '__PORT__',

  PASSWORD_KEY: '__PASSWORD_KEY__',

  DB_CONFIG: {
    DATABASE: '__DB_DATABASE__',
    USERNAME: '__DB_USERNAME__',
    PASSWORD: '__DB_PASSWORD__',
    HOST: '__DB_HOST__',
    DIALECT: '__DB_DIALECT__',
    PORT: '__DB_PORT__',
    SYNC: '__DB_SYNC__',
  },
}

module.exports = nconf
                  .argv()
                  .env(['NODE_ENV', 'PORT'])
                  // .file({ file: './config.json' })
                  .defaults(config);