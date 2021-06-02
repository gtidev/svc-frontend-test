require('dotenv').config();
const nconf = require('nconf');
const packageJson = require('./package.json');

const config = {
  ENV: process.env.ENV || 'dev',
  SERVICE_NAME: packageJson.name || 'Unnamed Service',
  PORT: process.env.PORT || '3000',
  DB_CONFIG: {
    DATABASE: process.env.DB_DATABASE || 'core',
    USERNAME: process.env.DB_USERNAME || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    HOST: process.env.DB_HOST || 'localhost',
    DIALECT: process.env.DB_DIALECT || 'mysql',
    PORT: process.env.DB_PORT || '3306',
    SYNC: false,
  },

  PASSWORD_KEY: process.env.PASSWORD_KEY || 'randomtoken',
}

module.exports = nconf
                  .argv()
                  .env(['NODE_ENV', 'PORT'])
                  // .file({ file: './config.json' })
                  .defaults(config);