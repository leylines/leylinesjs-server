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
  const leylinesSolids = await import('leylines-solids');
  const { latitude, longitude, bearing, form, category, solid, type } = req.params;

  const solids = JSON.parse(JSON.stringify(leylinesSolids[category][solid]));

  const czml = require('./createCzml');
  const geometry = require('./createGeometry');
  const postgis = require('./postGIS');

  let czmlfile = [];
  let points = [];
  let yinPoints = [];
  let yangPoints = [];
  let balancedPoints = [];

  const colors = [
    [119, 17, 85], [170, 68, 136], [204, 153, 187],
    [17, 68, 119], [68, 119, 170], [119, 170, 221],
    [17, 119, 119], [68, 170, 170], [119, 204, 204],
    [17, 119, 68], [68, 170, 119], [136, 204, 170],
    [119, 119, 17], [170, 170, 68], [221, 221, 119],
    [119, 68, 17], [170, 119, 68], [221, 170, 119],
    [119, 17, 34], [170, 68, 85], [221, 119, 136]
  ].map(color => [...color, 64]);

  const colorYin = [0, 255, 255];
  const colorYang = [255, 165, 0];
  const colorBalance = [115, 205, 50];

  points = await leylinesSolids.getPoints(latitude, longitude, bearing, form, solids.points);

  if (category === "beckerhagens") {
    const greenPoints = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 50, 52, 54, 56, 58];
    const bluePoints = [11, 13, 15, 17, 19, 40, 42, 44, 46, 48, 60, 61];
    const orangePoints = [1, 3, 5, 7, 9, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 51, 53, 55, 57, 59];

    points.forEach((gridPoint, i) => {
      if (greenPoints.includes(i)) {
        balancedPoints.push(points[i]);
      } else if (bluePoints.includes(i)) {
        yinPoints.push(points[i]);
      } else if (orangePoints.includes(i)) {
        yangPoints.push(points[i]);
      }
    });
  }

  czmlfile = await czml.createHeader(czmlfile);

  try {
    switch (type) {
      case "points":
        if (category === "beckerhagens") {
          czmlfile = await geometry.createPoints(czmlfile, yinPoints, 1, colorYin);
          czmlfile = await geometry.createPoints(czmlfile, yangPoints, 1, colorYang);
          czmlfile = await geometry.createPoints(czmlfile, balancedPoints, 1, colorBalance);
        } else {
          czmlfile = await geometry.createPoints(czmlfile, points, 1, colorYin);
        }
        break;
      case "area":
        czmlfile = await geometry.createPoints(czmlfile, yinPoints, 1, colorYin);
        czmlfile = await geometry.createPoints(czmlfile, yangPoints, 1, colorYang);
        czmlfile = await geometry.createPoints(czmlfile, balancedPoints, 1, colorBalance);
        czmlfile = await geometry.createArea(czmlfile, eval(`grids.area${shape}`));
        break;
      default:
        czmlfile = await geometry.createCorridor(czmlfile, points, solids.lines, solids.distance, solids.color);
        czmlfile = await postgis.pgFindPOI(czmlfile, pool, points, solids.lines, solids.distance, solids.color);
        break;
    }
  } catch (error) {
    console.log('caught', error.message);
  }

  return res.json(czmlfile);
};

exports.exportGrid = async function(req, res, pool) {
  const kml = require('./createKml');
  const leylinesSolids = await import('leylines-solids');

  const { latitude, longitude, bearing, form, category, solid, type } = req.params;

  const solids = JSON.parse(JSON.stringify(leylinesSolids[category][solid]));
  const points = await leylinesSolids.getPoints(latitude, longitude, bearing, form, solids.points);

  const styles = {
    highlight: {
      color: "#ff00d7ff",
      width: 5
    },
    color: solids.color,
    distance: solids.distance
  };

  const kmlName = `${category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()} ${solid.charAt(0).toUpperCase() + solid.slice(1).toLowerCase()}`;
  let kmlfile = [];
  const kmlHeader = await kml.getHeader(kmlName);
  const kmlFooter = await kml.getFooter();
  let kmlStyleMap = [];
  let kmlStyle = [];

  if (type === "lines") {
    kmlStyleMap = await kml.getLineStyleMap(`${category}-${solid}-${type}`);
    kmlStyle = await kml.getLineStyle(`${category}-${solid}-${type}`, styles);
  }

  try {
    const kmlGeometry = await kml.getGeometry(solids, points, category, solid, type, latitude, longitude, bearing, form);
    kmlfile = kmlHeader.concat(kmlStyleMap, kmlStyle, kmlGeometry, kmlFooter);
    const filename = `${category}_${form}_${solid}_${type}_${latitude}_${longitude}_${bearing}.kml`;
    res.header('Content-Type', 'text/xml');
    res.attachment(filename);
    res.status(200).send(kmlfile.join('\n'));
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }

};

exports.createPOI = async function(req, res, pool) {
  const czml = require('./createCzml');
  const postgis = require('./postGIS');
  const { schema, table, type } = req.params;

  const maintable = `${schema}.${table}`;
  const select = `
    SELECT 
      ${maintable}.id,
      ${maintable}.site as name,
      ${maintable}.description,
      ${maintable}.type,
      ${maintable}.sub_type,
      ${maintable}.data_owner,
      ${maintable}.links,
      ${maintable}.importance,
      ${maintable}.x_coord,
      ${maintable}.y_coord,
      ${maintable}.z_coord,
      ${maintable}.country 
    FROM ${maintable} 
    WHERE ${maintable}.type = '${type}';
  `;
  const scale = 0.2;
  let czmlfile = [];

  try {
     czmlfile = await czml.createHeader(czmlfile);
     czmlfile = await postgis.pgCreatePoint(czmlfile, pool, select, type, scale, "icons", "poi");
     return res.json(czmlfile);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }

};

exports.createMegalithic = async function(req, res, pool) {
  const czml = require('./createCzml.js');
  const postgis = require('./postGIS');
  const { type } = req.params;

  const select = `
    SELECT 
      id, 
      type, 
      name, 
      description, 
      data_owner, 
      x_coord, 
      y_coord, 
      icon, 
      country 
    FROM megalithic.sites 
    WHERE type_id = '${type}';
  `;
  const scale = 0.7;
  let czmlfile = [];

  try {
    czmlfile = await czml.createHeader(czmlfile);
    czmlfile = await postgis.pgCreatePoint(czmlfile, pool, select, "button_red", scale, "megalithic", "site");
    return res.json(czmlfile);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }

};

exports.createSacredSites = async function(req, res, pool) {
  const czml = require('./createCzml.js');
  const postgis = require('./postGIS');

  const select = `
    SELECT
      id,
      name,
      description,
      data_owner,
      x_coord,
      y_coord,
      country FROM sacredsites.sites;
  `;
  const scale = 0.2;
  let czmlfile = [];

  try {
    czmlfile = await czml.createHeader(czmlfile);
    czmlfile = await postgis.pgCreatePoint(czmlfile, pool, select, "button_cyan", scale, "icons", "site");
    return res.json(czmlfile);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }

};

exports.createAlesia = async function(req, res, pool) {
  const czml = require('./createCzml.js');
  const postgis = require('./postGIS');

  const select = `
    SELECT
      id,
      name,
      description,
      data_owner,
      x_coord,
      y_coord,
      country FROM alesia.sites;
  `;
  const scale = 0.2;
  let czmlfile = [];

  try {
    czmlfile = await czml.createHeader(czmlfile);
    czmlfile = await postgis.pgCreatePoint(czmlfile, pool, select, "star_255-255-66", scale, "icons", "site");
    return res.json(czmlfile);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }

};

exports.createInterfaithMary = async function(req, res, pool) {
  const czml = require('./createCzml.js');
  const postgis = require('./postGIS');

  const select = `
    SELECT
      id,
      name,
      description,
      image,
      data_owner,
      x_coord,
      y_coord,
      country FROM interfaithmary.sites;
  `;
  const scale = 0.2;
  let czmlfile = [];

  try {
    czmlfile = await czml.createHeader(czmlfile);
    czmlfile = await postgis.pgCreatePoint(czmlfile, pool, select, "button_yellow", scale, "icons", "site");
    return res.json(czmlfile);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }

};

exports.exportPOI = async function(req, res, pool) {
  const kml = require('./createKml');
  const postgis = require('./postGIS');
  const { schema, table, type } = req.params;

  const maintable = `${schema}.${table}`;
  const select = `
    SELECT 
      ${maintable}.id,
      ${maintable}.site as name,
      ${maintable}.description,
      ${maintable}.type,
      ${maintable}.sub_type,
      ${maintable}.data_owner,
      ${maintable}.links,
      ${maintable}.importance,
      ${maintable}.x_coord,
      ${maintable}.y_coord,
      ${maintable}.z_coord,
      ${maintable}.country 
    FROM ${maintable} 
    WHERE ${maintable}.type = $1;
  `;
  const scale = 0.2;

  let kmlfile = [];
  const kmlHeader = await kml.getHeader("Points of Interest");
  const kmlFooter = await kml.getFooter();
  const kmlStyle = await kml.getPointStyle(type);

  try {
    kmlfile = await postgis.pgExportPoint(kmlfile, pool, select, [type]);
    kmlfile = kmlHeader.concat(kmlStyle, kmlfile, kmlFooter);
    const filename = `${type}.kml`;
    res.header('Content-Type', 'text/xml');
    res.attachment(filename);
    res.status(200).send(kmlfile.join('\n'));
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }

};

exports.createSite = async function(req, res, pool) {

   var czml = require('./createCzml');
   var postgis = require('./postGIS');

   var maintable = req.params.schema + "." + req.params.table;
   var select = "SELECT * FROM "  + maintable + ";";
   var scale = 0.2;

   var czmlfile = [];

   czmlfile = await czml.createHeader(czmlfile);
   czmlfile = await postgis.pgCreatePoint(czmlfile, pool, select, req.params.table, scale, "icons", "site");
   return res.json(czmlfile);

};

exports.createRelated = async function(req, res, pool) {

   var czml = require('./createCzml');
   var postgis = require('./postGIS');

   var maintable = req.params.schema + "." + req.params.table;
   var select = "SELECT * FROM "  + maintable + ";";

   var czmlfile = [];

   czmlfile = await czml.createHeader(czmlfile);
   czmlfile = await postgis.pgCreateRelated(res, pool, select, "related", czmlfile, getResult);
   return res.json(czmlfile);

};

exports.createLine = async function(req, res, pool) {
  const czml = require('./createCzml');
  const postgis = require('./postGIS');
  var { schema, table, group, width, color, type } = req.params;

  const maintable = `${schema}.${table}`;
  var linewidth = parseInt(width);

  switch (type) {
    case 'major':
      color = '255,255,255';
      linewidth = 15000;
      break;
    case 'basic':
      color = '255,255,66';
      linewidth = 5000;
      break;
    case 'minor':
      color = '255,165,0';
      linewidth = 500;
      break;
  }

  const colorArray = color.split(",").map(x => parseInt(x));
  let czmlfile = [];

  try {
    czmlfile = await czml.createHeader(czmlfile);
    czmlfile = await postgis.pgGetMultiline(czmlfile, pool, maintable, group, linewidth, colorArray, type);
    czmlfile = await postgis.pgFindGisPOI(czmlfile, pool, group, linewidth, colorArray, type);
    return res.json(czmlfile);
  } catch (error) {
    console.error('Error creating line:', error.message);
    return res.status(500).send('Internal Server Error');
  }
};

exports.exportLine = async function(req, res, pool) {
  const kml = require('./createKml');
  const postgis = require('./postGIS');
  var { schema, table, group, width, color, type } = req.params;

  const maintable = `${schema}.${table}`;
  var linewidth = parseInt(width);

  switch (type) {
    case 'major':
      color = '255,255,255';
      linewidth = 15000;
      break;
    case 'basic':
      color = '255,255,66';
      linewidth = 5000;
      break;
    case 'minor':
      color = '255,165,0';
      linewidth = 500;
      break;
  }

  const colorArray = color.split(",").map(x => parseInt(x));

  const styles = {
    highlight: {
      color: "#ff00d7ff",
      width: 5
    },
    color: colorArray,
    distance: linewidth
  };

  const kmlName = group;
  let kmlfile = [];
  const kmlHeader = await kml.getHeader(kmlName);
  const kmlFooter = await kml.getFooter();
  const kmlStyleMap = await kml.getLineStyleMap(group);
  const kmlStyle = await kml.getLineStyle(group, styles);

  try {
    kmlfile = await postgis.pgExportMultiline(kmlfile, pool, maintable, group, linewidth, colorArray, type);
    kmlfile = kmlHeader.concat(kmlStyleMap, kmlStyle, kmlfile, kmlFooter);
    const filename = `${group}.kml`;
    res.header('Content-Type', 'text/xml');
    res.attachment(filename);
    res.status(200).send(kmlfile.join('\n'));
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

exports.createArrow = async function(req, res, pool) {

   var czml = require('./createCzml');
   var postgis = require('./postGIS');

   var maintable = req.params.schema + "." + req.params.table;
   var group = req.params.group;
   var linewidth = req.params.width;
   var color = req.params.color.split(",");

   var czmlfile  = [];

   czmlfile = await czml.createHeader(czmlfile);
   czmlfile = await postgis.pgCreateArrow(czmlfile, pool, maintable, group, linewidth, color);

   return res.json(czmlfile);
};

exports.createArea = async function(req, res, pool) {

   var czml = require('./createCzml.js');
   var postgis = require('./postGIS');

   var maintable = req.params.schema + "." + req.params.table;
   var color = [255,178,102,100];
   var extrudeheight = 10000;

   var czmlfile = [];

   czmlfile = await czml.createHeader(czmlfile);
   czmlfile = await postgis.pgCreateArea(czmlfile, pool, maintable, req.params.name, color, extrudeheight);
   return res.json(czmlfile);
};

exports.createRamar = async function(req, res, pool) {

   var czml = require('./createCzml.js');
   var czmlfile = [];

   // Print Header
   czmlfile = await czml.createHeader(czmlfile);

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
         description += "<tr><td colspan=\"2\"><img src=\"" + rows[i].image + "\" alt=\"" + rows[i].site + "\" style=\"width:360px\"></td></tr>";
         description += "<tr><td>Name</td><td>" + rows[i].site + "</td></tr>";
         description += "<tr><td>Description</td><td>" + rows[i].description + "</td></tr>";
         description += "<tr><td>Place</td><td>" + rows[i].place + "</td></tr>";
         description += "<tr><td>Country</td><td>" + rows[i].country + "</td></tr>";
         description += "</table>";
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
   czmlfile = await czml.createHeader(czmlfile);

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
         var icon = "/images/icons/ufo\ hotspot.png";
         var scale = 0.2;
         czmlfile = czml.createPoint(rows[i].id, rows[i].site, description, icon, scale, Number(rows[i].x_coord), Number(rows[i].y_coord), 0.0, czmlfile);
      }
   } finally {
      client.release()
      return res.json(czmlfile);
   }
};

