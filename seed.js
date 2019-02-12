require('dotenv').config();

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

module.exports = {
  dev: 'localhost/petes-pets',
  prod: process.env.MLAB_URI,
};
