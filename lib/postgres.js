'use strict';
const { Pool } = require('pg');

var config = {
  host: 'localhost',
  user: 'leylines',
  password: 'leylines',
  database: 'leylines',
};

exports.init_pool = function() {
  return new Pool(config);
};
