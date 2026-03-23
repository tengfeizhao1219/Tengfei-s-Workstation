const path = require('path');
const environment = process.env.NODE_ENV || 'development';

let config;
try {
  config = require(`./webpack/webpack.${environment}.js`);
} catch (error) {
  console.warn(`No webpack config found for environment: ${environment}, using development`);
  config = require('./webpack/webpack.dev.js');
}

module.exports = config;
