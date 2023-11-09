'use strict';

exports.pgFindPOI = async function(res, pool, data, lines, distance, color, czmlfile, callback) {

   var czml    = require('./createCzml');
   var html    = require('./createHTML');

   var multilinestring = []; 
   for (var i=0, tot=lines.length; i<tot; i++) {
      var fpointvalues = data[lines[i][0]].split('|');
      var spointvalues = data[lines[i][1]].split('|');
      multilinestring.push("(" + Number(fpointvalues[1]) + " " + Number(fpointvalues[2]) + " 0.0, " + Number(spointvalues[1]) + " " + Number(spointvalues[2]) + " 0.0)");
   }

   var uid = (new Date().getTime()).toString(36);
   const client = await pool.connect();
   try {
      await client.query('BEGIN');
      await client.query("CREATE TEMP TABLE temp_grid_" + uid + "(gid serial primary key, geom geometry(MultiLinestringZ,4326))");
      const insertLines = "INSERT INTO temp_grid_" + uid + "(geom) VALUES (ST_GeomFromText('MultiLinestringZ(" +  multilinestring.join(",") + ")',4326))";
      await client.query(insertLines)
      const selectPoints = "SELECT * FROM leylines.poi l INNER JOIN temp_grid_" + uid + " g ON ST_DWithin(l.geom::geography, g.geom::geography, " + distance + ")";
      const { rows } = await client.query(selectPoints);
      for (i=0, tot=rows.length; i<tot; i++) {
         var icon = "/images/icons/star_" + color[0] + "-" + color[1] + "-" + color[2] + ".svg";
         var scale = 0.05;
         var description = html.createFeatureInfo(rows[i]);
         czmlfile = czml.createPoint(rows[i].id, rows[i].site, description, icon, (rows[i].importance * 0.03), Number(rows[i].x_coord), Number(rows[i].y_coord), Number(rows[i].z_coord), czmlfile);
      }
      await client.query('COMMIT')
   } finally {
      client.release()
      callback(null, res, czmlfile);
   }

};

exports.pgCreatePoint = async function(res, pool, select, image, scale, dir, czmlfile, callback) {

   var czml  = require('./createCzml');
   var html  = require('./createHTML');

   var icon  = "/images/" + dir + "/" + image.toLowerCase() + ".png";

   const client = await pool.connect();
   try {
      const { rows } = await client.query(select);
      for (var i=0, tot=rows.length; i<tot; i++) {
         var description = html.createFeatureInfo(rows[i]);
         czmlfile = czml.createPoint(rows[i].id, rows[i].site, description, icon, scale, Number(rows[i].x_coord), Number(rows[i].y_coord), Number(rows[i].z_coord), czmlfile);
      }
   } finally {
      client.release()
      callback(null, res, czmlfile);
   }

};

exports.pgCreateRelated = async function(res, pool, select, dir, czmlfile, callback) {

   var czml  = require('./createCzml');
   var html  = require('./createHTML');


   const client = await pool.connect();
   try {
      const { rows } = await client.query(select);
      for (var i=0, tot=rows.length; i<tot; i++) {
         var description = html.createFeatureInfo(rows[i]);
         var icon  = rows[i].image;
         czmlfile = czml.createPoint(rows[i].id, rows[i].website, description, icon, rows[i].scale, Number(rows[i].x_coord), Number(rows[i].y_coord), Number(rows[i].z_coord), czmlfile);
      }
   } finally {
      client.release()
      callback(null, res, czmlfile);
   }

};

exports.pgCreateLine = async function(res, pool, maintable, group, linewidth, color, czmlfile, callback) {

   var czml  = require('./createCzml');

   var select = "SELECT ST_AsGeoJSON(geom), name, description FROM " + maintable + " WHERE \"group\" = '" + group + "';";

   const client = await pool.connect();
   try {
      const { rows } = await client.query(select);
      for (var id=0, tot=rows.length; id<tot; id++) {
         var multilines = JSON.parse(rows[id].st_asgeojson);
         var multiline = [];
         for (var j=0, subtot=multilines.coordinates.length; j<subtot; j++) {
            multiline.push(multilines.coordinates[j][0]);
            multiline.push(multilines.coordinates[j][1]);
            multiline.push(0.0);
         }
         if (rows[id].description  == "Straight") {
           color = [255,0,0,128];
           linewidth = 6000;
         }
         if (rows[id].description  == "Follow") {
           color = [255,255,0,128];
           linewidth = 6000;
         }
         if (rows[id].description  == "Circle") {
           color = [255,165,0,128];
           linewidth = 12000;
         }
         czmlfile = czml.createCorridorCarto(id, rows[id].name, rows[id].description, linewidth, color, multiline, czmlfile);
      }
   } finally {
      client.release()
      callback(null, res, czmlfile);
  }

};

exports.pgCreateArrow = async function(res, pool, maintable, group, linewidth, color, czmlfile, callback) {

   var czml  = require('./createCzml');

   var select = "SELECT ST_AsGeoJSON(geom), name, description FROM " + maintable + " WHERE \"group\" = '" + group + "';";

   const client = await pool.connect();
   try {
      const { rows } = await client.query(select);
      for (var id=0, tot=rows.length; id<tot; id++) {
         var multilines = JSON.parse(rows[id].st_asgeojson);
         for (var line=0, subtot=multilines.coordinates.length; line<subtot; line++) {
            var multiline = [];
            for (var i=0, subtot1=multilines.coordinates[line].length; i<subtot1; i++) {
               multiline.push(multilines.coordinates[line][i][0]);
               multiline.push(multilines.coordinates[line][i][1]);
               multiline.push(0.0);
            }
            czmlfile = czml.createArrowCarto(id, rows[id].name, rows[id].description, linewidth, color, multiline, czmlfile);
         }
      }
   } finally {
      client.release()
      callback(null, res, czmlfile);
  }

};

exports.pgCreateArea = async function(res, pool, maintable, name, color, extrudeheight, czmlfile, callback) {

   var czml  = require('./createCzml');

   var select = "SELECT ST_AsGeoJSON(geom) FROM " + maintable + " WHERE name = '" + name + "';";

   const client = await pool.connect();
   try {
      const { rows } = await client.query(select);
      for (var i=0, tot=rows.length; i<tot; i++) {
         var polygons = JSON.parse(rows[i].st_asgeojson);
         for (var id=0, tot1=polygons.coordinates.length; id<tot1; id++) {
            var polygon = [];
            for (var j=0, tot2=polygons.coordinates[id][0].length; j<tot2; j++) {
               polygon.push(polygons.coordinates[id][0][j][0]);
               polygon.push(polygons.coordinates[id][0][j][1]);
               polygon.push(0.0);
            }
            czmlfile = czml.createPolygonCarto(id, id, id, color, extrudeheight, polygon, czmlfile);
         }
      }
   } finally {
      client.release()
      callback(null, res, czmlfile);
  }

};

