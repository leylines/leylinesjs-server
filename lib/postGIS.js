'use strict';

exports.pgGetMultiline = async function(czmlfile, pool, maintable, group, linewidth, color) {

   var html     = require('./createHTML');
   var geometry = require('./createGeometry');

   var select = "SELECT ST_AsGeoJSON(geom), id, name, description FROM " + maintable + " WHERE \"group\" = '" + group + "';";

   const client = await pool.connect();
   try {
      const { rows } = await client.query(select);
      for (var id=0, tot=rows.length; id<tot; id++) {
         var polylines = JSON.parse(rows[id].st_asgeojson);
         var polyline = []
         for (var j=0, subtot=polylines.coordinates.length; j<subtot; j++) {
            polyline.push(polylines.coordinates[j][0],polylines.coordinates[j][1],Number(0.0));
         }
         var description = html.createFeatureInfo(rows[id], "line", "internal");
         czmlfile = await geometry.createGisCorridor(czmlfile, id, polyline, rows[id].name, description, linewidth, color);
      }
   } finally {
      client.release()
      return czmlfile;
   }

};

exports.pgExportMultiline = async function(kmlfile, pool, maintable, group, linewidth, color) {

   var html     = require('./createHTML');
   var kml      = require('./createKML');

   var select = "SELECT ST_AsGeoJSON(geom), id, name, description FROM " + maintable + " WHERE \"group\" = '" + group + "';";

   const client = await pool.connect();
   try {
      const { rows } = await client.query(select);
      for (var id=0, tot=rows.length; id<tot; id++) {
         var polylines = JSON.parse(rows[id].st_asgeojson);
         var polyline = []
         for (var j=0, subtot=polylines.coordinates.length; j<subtot; j++) {
            polyline.push([polylines.coordinates[j][0],polylines.coordinates[j][1]]);
         }
         var description = html.createFeatureInfo(rows[id], "line", "internal");
         kmlfile = await kml.getLine(kmlfile, id, polyline, rows[id].name, description, group);
      }
   } finally {
      client.release()
      return kmlfile;
   }

};

exports.pgFindGisPOI = async function(czmlfile, pool, group, distance, color) {

   var czml    = require('./createCzml');
   var html    = require('./createHTML');

   const client = await pool.connect();
   try {
      const selectPoints = "SELECT * FROM leylines.poi l INNER JOIN leylines.lines g ON \"group\"='" + group + "' AND ST_DWithin(l.geom::geography, g.geom::geography, " + distance + ")";
      const { rows } = await client.query(selectPoints);
      for (var i=0, tot=rows.length; i<tot; i++) {
         var icon = "/images/icons/star_" + color[0] + "-" + color[1] + "-" + color[2] + ".svg";
         var scale = 0.05;
         var description = html.createFeatureInfo(rows[i], "poi", "internal");
         czmlfile = czml.createPoint(rows[i].id, rows[i].site, description, icon, (rows[i].importance * 0.03), Number(rows[i].x_coord), Number(rows[i].y_coord), Number(rows[i].z_coord), czmlfile);
      }
   } finally {
      client.release()
      return(czmlfile);
   }

};

exports.pgFindPOI = async function(czmlfile, pool, points, lines, distance, color) {

   var czml    = require('./createCzml');
   var html    = require('./createHTML');

   var multilinestring = []; 
   for (var i=0, tot=lines.length; i<tot; i++) {
      multilinestring.push("(" + Number(points[lines[i][0]][1]) + " " + Number(points[lines[i][0]][2]) + " 0.0, " + Number(points[lines[i][1]][1]) + " " + Number(points[lines[i][1]][2]) + " 0.0)");
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
         rows[i]['name'] = rows[i]['site'];
         var description = html.createFeatureInfo(rows[i], "poi", "internal");
         czmlfile = czml.createPoint(rows[i].id, rows[i].site, description, icon, (rows[i].importance * 0.03), Number(rows[i].x_coord), Number(rows[i].y_coord), Number(rows[i].z_coord), czmlfile);
      }
      await client.query('COMMIT')
   } finally {
      client.release()
      return(czmlfile);
   }

};

exports.pgCreatePoint = async function(czmlfile, pool, select, image, scale, dir, type) {

   var czml  = require('./createCzml');
   var html  = require('./createHTML');

   var icon  = "/images/" + dir + "/" + image.toLowerCase() + ".png";

   const client = await pool.connect();
   try {
      const { rows } = await client.query(select);
      for (var i=0, tot=rows.length; i<tot; i++) {
         var description = html.createFeatureInfo(rows[i], type, "internal");
         if (rows[i].icon) {
            czmlfile = czml.createPoint(rows[i].id, rows[i].name, description, "/images/" + dir + "/" + rows[i].icon + ".png", scale, Number(rows[i].x_coord), Number(rows[i].y_coord), Number(rows[i].z_coord), czmlfile);
         } else {
            czmlfile = czml.createPoint(rows[i].id, rows[i].name, description, icon, scale, Number(rows[i].x_coord), Number(rows[i].y_coord), Number(rows[i].z_coord), czmlfile);
         }
      }
   } finally {
      client.release()
      return(czmlfile);
   }

};

exports.pgExportPoint = async function(kmlfile, pool, select, type) {

   var kml   = require('./createKml');
   var html  = require('./createHTML');

   //console.log(kmlfile);
   const client = await pool.connect();
   try {
      const { rows } = await client.query(select);
      kmlfile.push("   <Folder>");
      kmlfile.push("   <name>" + type + "</name>");
      //rows = rows.sort(function(a, b) {
      //  return a[1].localeCompare(b[1]);
      //});
      for (var i=0, tot=rows.length; i<tot; i++) {
         var description = html.createFeatureInfo(rows[i], "poi", "external");
         kmlfile = await kml.createPoint(rows[i].name, description, Number(rows[i].x_coord), Number(rows[i].y_coord), Number(rows[i].z_coord), type, kmlfile);
      }
      kmlfile.push("   </Folder>");
   } finally {
      client.release()
      return(kmlfile);
   }

};

exports.pgCreateRelated = async function(czmlfile, pool, select, dir) {

   var czml  = require('./createCzml');
   var html  = require('./createHTML');

   const client = await pool.connect();
   try {
      const { rows } = await client.query(select);
      for (var i=0, tot=rows.length; i<tot; i++) {
         var description = html.createFeatureInfo(rows[i], "site", "internal");
         var icon  = rows[i].image;
         czmlfile = czml.createPoint(rows[i].id, rows[i].website, description, icon, rows[i].scale, Number(rows[i].x_coord), Number(rows[i].y_coord), Number(rows[i].z_coord), czmlfile);
      }
   } finally {
      client.release()
      return(czmlfile);
   }

};

exports.pgCreateLine = async function(czmlfile, maintable, group, linewidth, color) {

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
      return(czmlfile);
  }

};

exports.pgCreateArrow = async function(czmlfile, pool, maintable, group, linewidth, color) {

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
      return(czmlfile);
  }

};

exports.pgCreateArea = async function(czmlfile, pool, maintable, name, color, extrudeheight) {

   var czml  = require('./createCzml');
   var select = "SELECT ST_AsGeoJSON(geom), name, description FROM " + maintable + " WHERE name = '" + name + "';";

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
            czmlfile = czml.createPolygonCarto(id, rows[i].name, rows[i].description, color, extrudeheight, polygon, czmlfile);
         }
      }
   } finally {
      client.release()
      return(czmlfile);
  }

};

