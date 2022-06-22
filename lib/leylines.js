'use strict';

function getResult (err, res, result) {
   if (err) {
      console.log(err);
      res.status(500).send('Something failed!');
   } else {
      return res.json(result);
   }
};

exports.createCircle = function(req, res, pool) {

	var czml = require('./createCzml');

	var lat1 = req.params.lat1;
	var lon1 = req.params.lon1;
	var lat2 = req.params.lat2;
	var lon2 = req.params.lon2;
	var type = req.params.type;

	var czmlfile = [];
	var czmlfile = czml.createHeader(czmlfile);

	if (type == "spherical") {

		var LatLon = require('geodesy').LatLonSpherical;

		var referencesvalues = [];
		referencesvalues.push(Number(lon1));
		referencesvalues.push(Number(lat1));
		referencesvalues.push(Number(0));

		var p1 = new LatLon(lat1, lon1);
		var p2 = new LatLon(lat2, lon2);

		var bearing = p1.bearingTo(p2).toFixed(20);
		console.log(bearing);

		for (var i=1, tot=7; i<=tot; i++) {

			var distance = i * 5000000;
			var destpoints = p2.destinationPoint(distance, bearing);

			var name = i;
			referencesvalues.push(Number(destpoints['lon']));
			referencesvalues.push(Number(destpoints['lat']));
			referencesvalues.push(Number(0));

			var color = [119, 17, 85, 64];
			var linewidth = 20000;
			//czmlfile = czml.createCorridorCarto(name + "c", name, name, linewidth, color, referencesvalues, czmlfile);
			czmlfile = czml.createPolylineCarto(name + "p", name, name, 3, color, referencesvalues, czmlfile);
		}

		referencesvalues.push(Number(lon1));
		referencesvalues.push(Number(lat1));
		referencesvalues.push(Number(0));

	} else {

		var LatLon = require('geodesy').LatLonEllipsoidal;

		var referencesvalues = [];

		referencesvalues.push(Number(lon1));
		referencesvalues.push(Number(lat1));
		referencesvalues.push(Number(0));

		var p1 = new LatLon(lat1, lon1);
		var p2 = new LatLon(lat2, lon2);

		var bearing = p1.initialBearingTo(p2).toFixed(20);
		console.log(bearing);

		for (var i=1, tot=80; i<=tot; i++) {

			var distance = i * 2000000;
			var destpoints = p1.destinationPoint(distance, bearing);

			referencesvalues.push(Number(destpoints['lon']));
			referencesvalues.push(Number(destpoints['lat']));
			referencesvalues.push(Number(0));

		}

		var color = [119, 17, 85, 255];
		var linewidth = 200000;
		var name = "plus";;
		//czmlfile = czml.createCorridorCarto(name + "c", name, name, linewidth, color, referencesvalues, czmlfile);
		czmlfile = czml.createPolylineCarto(name + "p", name, name, 3, color, referencesvalues, czmlfile);

		var referencesvalues = [];
		var bearing = p2.initialBearingTo(p1).toFixed(20);
		console.log(bearing);

		for (var i=80, tot=1; i>=tot; i--) {

			var distance = i * 2000000;
			var destpoints = p2.destinationPoint(distance, bearing);

			var name = "-" + i;
			referencesvalues.push(Number(destpoints['lon']));
			referencesvalues.push(Number(destpoints['lat']));
			referencesvalues.push(Number(0));

		}

		referencesvalues.push(Number(lon1));
		referencesvalues.push(Number(lat1));
		referencesvalues.push(Number(0));

		var color = [119, 255, 85, 255];
		var linewidth = 20000;
		var name = "minus";;
		//czmlfile = czml.createCorridorCarto(name + "c", name, name, linewidth, color, referencesvalues, czmlfile);
		czmlfile = czml.createPolylineCarto(name + "p", name, name, 3, color, referencesvalues, czmlfile);

	}

	return res.json(czmlfile);

};

exports.createGrid = async function(req, res, pool) {

	var czml   = require('./createCzml');
	var math   = require('./Math');
	var solids = require('./platonicSolids');
	var grids  = require('./grids.js');
	var geometry = require('./createGeometry');
	var postgis = require('./postGIS');

	var czmlfile = [];
	var points = [];

	var lat = req.params.lat1;
	var lon = req.params.lon1;
	var azi = -math.radians(req.params.azi);

	var shape = req.params.shape;
	var type = req.params.type;

	var colors = [
	  [119, 17, 85], [170, 68, 136], [204, 153, 187],
	  [17, 68, 119], [68, 119, 170], [119, 170, 221],
	  [17, 119, 119], [68, 170, 170], [119, 204, 204],
	  [17, 119, 68], [68, 170, 119], [136, 204, 170],
	  [119, 119, 17], [170, 170, 68], [221, 221, 119],
	  [119, 68, 17], [170, 119, 68], [221, 170, 119],
	  [119, 17, 34], [170, 68, 85], [221, 119, 136]
	]

	for (var i = 0; i < colors.length; i++) {
		colors[i].push(64);
	}

	var colorMain  = [255,255,66];
	var colorMinor = [255,165,0];
	var distanceMain   = 120000.0;
	var distanceMinor  = 60000.0;

	czml.createHeader(czmlfile);
	points = solids.calculateGridPoints(lat, lon, azi, shape, type, czmlfile);

    switch (type) {
       case "points":
          czmlfile =  geometry.createPoints(res, points, 1, czmlfile, null);
          return res.json(czmlfile);
       case "area":
          try {
             czmlfile = geometry.createPoints(res, points, 0, czmlfile, eval('grids.area' + shape));
          } catch (error) {
             console.log('caught', error.message);
          }
          try {
             geometry.createArea(res, czmlfile, eval('grids.area' + shape), getResult);
          } catch (error) {
             console.log('caught', error.message);
          }
          return;
       case "1":
          try {
             czmlfile = geometry.createCorridor(res, points, eval('grids.main' + shape), distanceMain, colorMain, czmlfile);
          } catch (error) {
             console.log('caught', error.message);
          }
          try {
             postgis.pgFindPOI(res, pool, points, eval('grids.main' + shape), distanceMain, colorMain, czmlfile, getResult);
          } catch (error) {
             console.log('caught', error.message);
          }
          return;
       case "2":
          try {
             czmlfile = geometry.createCorridor(res, points, eval('grids.minor' + shape), distanceMinor, colorMinor, czmlfile);
          } catch (error) {
             console.log('caught', error.message);
          }
          try {
             postgis.pgFindPOI(res, pool, points, eval('grids.minor' + shape), distanceMinor, colorMinor, czmlfile, getResult);
          } catch (error) {
             console.log('caught', error.message);
          }
          return;
    }

};

exports.createPOI = function(req, res, pool) {

	var czml = require('./createCzml');
	var postgis = require('./postGIS');

	var maintable = req.params.schema + "." + req.params.table;

	var select = "SELECT " + maintable + ".id," + maintable + ".site," + maintable + ".description," + maintable + ".type," + maintable + ".sub_type," + maintable + ".data_owner," + maintable + ".links," + maintable + ".importance," + maintable + ".x_coord," + maintable + ".y_coord," + maintable + ".z_coord," + maintable + ".country" + " FROM "  + maintable  + " WHERE " + maintable + ".type = '" + req.params.type + "';";

	var scale = 0.2;

	var czmlfile = [];

	// Print Header
	czmlfile = czml.createHeader(czmlfile);

	postgis.pgCreatePoint(res, pool, select, req.params.type, scale, "icons", czmlfile, getResult);

};

exports.createSite = function(req, res, pool) {

	var czml = require('./createCzml');
	var postgis = require('./postGIS');

	var maintable = req.params.schema + "." + req.params.table;

	var select = "SELECT * FROM "  + maintable + ";";

	var scale = 0.2;

	var czmlfile = [];

	// Print Header
	czmlfile = czml.createHeader(czmlfile);

	postgis.pgCreatePoint(res, pool, select, req.params.table, scale, "icons", czmlfile, getResult);

};

exports.createRelated = function(req, res, pool) {

	var czml = require('./createCzml');
	var postgis = require('./postGIS');

	var maintable = req.params.schema + "." + req.params.table;

	var select = "SELECT * FROM "  + maintable + ";";

	var czmlfile = [];

	// Print Header
	czmlfile = czml.createHeader(czmlfile);

	postgis.pgCreateRelated(res, pool, select, "related", czmlfile, getResult);

};

exports.createLine = function(req, res, pool) {

	var czml = require('./createCzml');
	var postgis = require('./postGIS');

	var maintable = req.params.schema + "." + req.params.table;
	var group = req.params.group;
	var linewidth = req.params.width;
	var color = req.params.color.split(",");

	var czmlfile  = [];

	// Print Header
	czml.createHeader(czmlfile);

	postgis.pgCreateLine(res, pool, maintable, group, linewidth, color, czmlfile, getResult);
};

exports.createArrow = function(req, res, pool) {

	var czml = require('./createCzml');
	var postgis = require('./postGIS');

	var maintable = req.params.schema + "." + req.params.table;
	var group = req.params.group;
	var linewidth = req.params.width;
	var color = req.params.color.split(",");

	var czmlfile  = [];

	// Print Header
	czml.createHeader(czmlfile);
   
	postgis.pgCreateArrow(res, pool, maintable, group, linewidth, color, czmlfile, getResult);
};

exports.createArea = function(req, res, pool) {

	var czml = require('./createCzml.js');
	var postgis = require('./postGIS');

	var maintable = req.params.schema + "." + req.params.table;
        var color = [255,178,102,100];
        var extrudeheight = 10000;

	var czmlfile = [];

	// Print Header
	czml.createHeader(czmlfile);

	postgis.pgCreateArea(res, pool, maintable, req.params.name, color, extrudeheight, czmlfile, getResult);
};

exports.createMegalithic = async function(req, res, pool) {

   var czml = require('./createCzml.js');
   var czmlfile = [];

   // Print Header
   czmlfile = czml.createHeader(czmlfile);

   var select = "SELECT sid, object_type, place, x_coord, y_coord, icon, country FROM megalithic.sites";
   select += " WHERE type_id = '";
   select += req.params.type;
   select += "';";

   const client = await pool.connect();
   try {
      const { rows } = await client.query(select);
      console.log(rows);
      for (var i=0, tot=rows.length; i<tot; i++) {
         var description = "<!--HTML-->\r\n";
         description += "<table>";
         description += "<tr><td width=\"120px\">Country</td><td width=\"50px\"></td><td>" + rows[i].country + "</td></tr>";
         description += "<tr><td>Type</td><td><img src=\"/images/megalithic/" + rows[i].icon + ".gif\"><td>" + rows[i].object_type + "</td></tr>";
         description += "<tr><td>Data Custodian</td><td></td><td><a href=\"http://www.megalithic.co.uk/article.php?sid=" + rows[i].sid + "\" target=\"_blank\">megalithic.co.uk</a></td></tr>";
         description += "</table>";
         description += "\r\n</p>";
         var icon = "/images/megalithic/" + rows[i].icon + ".gif";
         var scale = 0.7;
         czmlfile = czml.createPoint(rows[i].sid, rows[i].place, description, icon, scale, Number(rows[i].x_coord), Number(rows[i].y_coord), 0.0, czmlfile);
      }
   } finally {
      client.release()
      return res.json(czmlfile);
   }
};

exports.createRamar = async function(req, res, pool) {

   var czml = require('./createCzml.js');
   var czmlfile = [];

   // Print Header
   czmlfile = czml.createHeader(czmlfile);

   var select = "SELECT id, site, place, description, object_type, image, x_coord, y_coord, country FROM ramar.poi";
   select += " WHERE object_type = '";
   select += req.params.type;
   select += "';";

   const client = await pool.connect();
   try {
      const { rows } = await client.query(select);
      for (var i=0, tot=rows.length; i<tot; i++) {
         var description = "<!--HTML-->\r\n";
         description += "<table>";
         description += "<tr><td colspan=\"3\"><img src=\"" + rows[i].image + "\" alt=\"" + rows[i].site + "\" style=\"width:360px\"></td></tr>";
         description += "<tr><td>Name</td><td></td><td>" + rows[i].site + "</td></tr>";
         description += "<tr><td>Description</td><td></td><td>" + rows[i].description + "</td></tr>";
         description += "<tr><td>Place</td><td></td><td>" + rows[i].place + "</td></tr>";
         description += "<tr><td>Country</td><td></td><td>" + rows[i].country + "</td></tr>";
         description += "</table>";
         description += "\r\n</p>";
         var icon = "/images/ramar/" + rows[i].object_type + ".png";
         var scale = 0.5;
         czmlfile = czml.createPoint(rows[i].id, rows[i].site, description, icon, scale, Number(rows[i].x_coord), Number(rows[i].y_coord), 0.0, czmlfile);
      }
   } finally {
      client.release()
      return res.json(czmlfile);
   }
};

exports.createCifex = async function(req, res, pool) {

   var czml = require('./createCzml.js');
   var czmlfile = [];

   // Print Header
   czmlfile = czml.createHeader(czmlfile);

   var select = "SELECT id, site, link, description, object_type, image, x_coord, y_coord FROM cifex.poi";
   select += " WHERE object_type = '";
   select += req.params.type;
   select += "';";

   const client = await pool.connect();
   try {
      const { rows } = await client.query(select);
      for (var i=0, tot=rows.length; i<tot; i++) {
         var description = "<!--HTML-->\r\n";
         description += "<table>";
         description += "<tr><td colspan=\"3\"><img src=\"" + rows[i].image + "\" alt=\"" + rows[i].site + "\" style=\"width:360px\"></td></tr>";
         description += "<tr><td>Name</td><td></td><td>" + rows[i].site + "</td></tr>";
         description += "<tr><td>Description</td><td></td><td>" + rows[i].description + "</td></tr>";
         description += "<tr><td>Link</td><td></td><td><a href=\"" + rows[i].link + "\">Article on cifex.space</a></td></tr>";
         description += "</table>";
         description += "\r\n</p>";
         var icon = "/images/icons/ufo\ hotspot.png";
         var scale = 0.2;
         czmlfile = czml.createPoint(rows[i].id, rows[i].site, description, icon, scale, Number(rows[i].x_coord), Number(rows[i].y_coord), 0.0, czmlfile);
      }
   } finally {
      client.release()
      return res.json(czmlfile);
   }
};

