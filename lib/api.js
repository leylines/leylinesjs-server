"use strict";

var express = require('express');
var leylines = require('./leylines');
var pg_pool = require('./postgres');

module.exports = function(options) {

  var pgConnectionString = options.pgConnectionString || [];
  var pool = pg_pool.init_pool(pgConnectionString);

  // routes for postgis api
  var router = express.Router();    // get an instance of the express Router

  router.get('/points/:schema/:table/:type', function(req, res) {
      leylines.createPOI(req, res, pool);
  });

  router.get('/sites/:schema/:table', function(req, res) {
      leylines.createSite(req, res, pool);
  });

  router.get('/related/:schema/:table', function(req, res) {
      leylines.createRelated(req, res, pool);
  });

  router.get('/areas/:schema/:table/:name', function(req, res) {
      leylines.createArea(req, res, pool);
  });

  router.get('/line/:schema/:table/:group/:width/:color', function(req, res) {
      leylines.createLine(req, res, pool);
  });

  router.get('/arrow/:schema/:table/:group/:width/:color', function(req, res) {
      leylines.createArrow(req, res, pool);
  });

  router.get('/createGrid/:latitude/:longitude/:bearing/:form/:category/:solid/:type', function(req, res) {
      leylines.createGrid(req, res, pool);
  });

  router.get('/createCircle/:lat1/:lon1/:lat2/:lon2/:type', function(req, res) {
      leylines.createCircle(req, res, pool);
  });

  router.get('/megalithic/:type', function(req, res) {
      leylines.createMegalithic(req, res, pool);
  });

  router.get('/ramar/:type', function(req, res) {
      leylines.createRamar(req, res, pool);
  });

  router.get('/cifex/:type', function(req, res) {
      leylines.createCifex(req, res, pool);
  });

  router.get('/new-point', function(req, res) {
      res.status(301).redirect("https://survey123.arcgis.com/share/6313e1587ec34892a4ea0b4dd03ef1c7?portalUrl=https://uzh.maps.arcgis.com");
  });

  router.get('/new-line', function(req, res) {
      res.status(301).redirect("https://survey123.arcgis.com/share/c2d6790592d94084967cb3bf52d0eb1e?portalUrl=https://uzh.maps.arcgis.com");
  });

  return router;

};

