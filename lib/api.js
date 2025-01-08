"use strict";

const express = require('express');
const leylines = require('./leylines');
const pg_pool = require('./postgres');

module.exports = function(options) {
  const { pgConnectionString = [] } = options;
  const pool = pg_pool.init_pool(pgConnectionString);

  const router = express.Router();

  const createHandler = (method) => async (req, res) => {
    try {
      await leylines[method](req, res, pool);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };

  router.get('/points/:schema/:table/:type', createHandler('createPOI'));
  router.get('/exportPoints/:schema/:table/:type', createHandler('exportPOI'));
  router.get('/sites/:schema/:table', createHandler('createSite'));
  router.get('/related/:schema/:table', createHandler('createRelated'));
  router.get('/areas/:schema/:table/:name', createHandler('createArea'));
  router.get('/line/:schema/:table/:group/:type?/:width/:color', createHandler('createLine'));
  router.get('/exportLine/:schema/:table/:group/:type?/:width/:color', createHandler('exportLine'));
  router.get('/arrow/:schema/:table/:group/:width/:color', createHandler('createArrow'));
  router.get('/createGrid/:latitude/:longitude/:bearing/:form/:category/:solid/:type', createHandler('createGrid'));
  router.get('/exportGrid/:latitude/:longitude/:bearing/:form/:category/:solid/:type', createHandler('exportGrid'));
  router.get('/createCircle/:lat1/:lon1/:lat2/:lon2/:type', createHandler('createCircle'));
  router.get('/megalithic/:type', createHandler('createMegalithic'));
  router.get('/ramar/:type', createHandler('createRamar'));
  router.get('/sacredSites', createHandler('createSacredSites'));
  router.get('/interfaithMary', createHandler('createInterfaithMarySites'));
  router.get('/cifex/:type', createHandler('createCifex'));

  router.get('/new-point', (req, res) => {
    res.status(301).redirect("https://survey123.arcgis.com/share/6313e1587ec34892a4ea0b4dd03ef1c7?portalUrl=https://uzh.maps.arcgis.com");
  });

  router.get('/new-line', (req, res) => {
    res.status(301).redirect("https://survey123.arcgis.com/share/c2d6790592d94084967cb3bf52d0eb1e?portalUrl=https://uzh.maps.arcgis.com");
  });

  return router;
};
