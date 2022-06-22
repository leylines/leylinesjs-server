'use strict';
var Pool = require('pg').Pool;

var config = {
  host: 'localhost',
  user: 'leylines',
  password: 'leylines',
  database: 'leylines',
};

exports.init_pool = function() {
    var pool = new Pool(config)
    return pool;
};

