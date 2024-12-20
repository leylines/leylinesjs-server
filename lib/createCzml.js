'use strict';

exports.createHeader = async function(results) {
   results.push({"id": "document", "name": "simple", "version": "1.0"});
   return results;
};

exports.createPoint = function(id, name, description, icon, scale, x_coord, y_coord, z_coord, results) {
  const point = {
    id,
    name,
    description,
  };

  if (icon) {
    point.billboard = {
      eyeOffset: { cartesian: [0, 0, 0] },
      horizontalOrigin: "CENTER",
      image: icon,
      heightReference: "CLAMP_TO_GROUND",
      pixelOffset: { cartesian2: [0, 0] },
      scale,
      show: true,
      verticalOrigin: "CENTER",
    };
  }

  point.position = {
    cartographicDegrees: [x_coord, y_coord, z_coord],
  };

  results.push(point);
  return results;
};

exports.createPolyline = function(id, name, description, linewith, colorvalue, referencesvalues, results) {
	var line = {};
	line.id = id;
	line.name = name;
	line.description = description;
	var polyline = {};
	polyline.width = linewith;
	polyline.followSurface = true;
	var rgba = {};
	rgba.rgba = colorvalue;
	var solidColor = {};
	solidColor.color = rgba;
	var material = {};
	material.solidColor = solidColor;
	var glowColor = {};
	glowColor.color = rgba;
	glowColor.glowPower = 0.99;
	material.polylineGlow = glowColor;
	polyline.material = material;
	//var referencesvalues = [frompoint + "#position", topoint + "#position"];
	var references = {};
	references.references = referencesvalues;
	polyline.positions = references;
	line.polyline = polyline;
	results.push(line);
	return results;
};

exports.createPolylineCarto = async function(id, name, description, linewith, colorvalue, referencesvalues, results) {
	var line = {};
	line.id = id;
	line.name = name;
	line.description = description;
	var polyline = {};
	polyline.width = linewith;
	polyline.followSurface = true;
	var rgba = {};
	rgba.rgba = colorvalue;
	//var solidColor = {};
	//solidColor.color = rgba;
	var material = {};
	//material.solidColor = solidColor;
	var glowColor = {};
	glowColor.color = rgba;
	glowColor.glowPower = 0.2;
	material.polylineGlow = glowColor;
	polyline.material = material;
	var carto = {};
	carto.cartographicDegrees = referencesvalues;
	polyline.positions = carto;
	line.polyline = polyline;
	results.push(line);
	return results;
};

exports.createCorridorCarto = async function(id, name, description, linewidth, colorvalue, referencesvalues, results) {
	var line = {};
	line.id = id;
	line.name = name;
	line.description = description;
	var corridor = {};
	corridor.width = linewidth;
	corridor.height = 0;
	var rgba = {};
	rgba.rgba = colorvalue;
	var solidColor = {};
	solidColor.color = rgba;
	var material = {};
	material.solidColor = solidColor;
	corridor.material = material;
	corridor.outline = false;
	var carto = {};
	carto.cartographicDegrees = referencesvalues;
	corridor.positions = carto;
	line.corridor = corridor;
	results.push(line);
	return results;
};

exports.createArrowCarto = function(id, name, description, linewidth, colorvalue, referencesvalues, results) {
	var line = {};
	line.id = id;
	line.name = name;
	line.description = description;
	var polyline = {};
	polyline.width = linewidth;
	var rgba = {};
	rgba.rgba = colorvalue;
	var solidColor = {};
	solidColor.color = rgba;
	var material = {};
	var polylineArrow = {};
	material.polylineArrow = solidColor;
	polyline.material = material;
	polyline.outline = false;
	var carto = {};
	carto.cartographicDegrees = referencesvalues;
	polyline.positions = carto;
	line.polyline = polyline;
	results.push(line);
	return results;
};

exports.createMultiline = function(linewidth, color, startpoint, endpoints, results) {
	for (var i=0, tot=endpoints.length; i<tot; i++) {
		var polylinereference = [];
		var polylineid = startpoint + "" + endpoints[i];
		polylinereference.push(startpoint + "#position");
		polylinereference.push(endpoints[i] + "#position");
		results = exports.createPolyline(polylineid, polylineid, polylineid, linewidth, color, polylinereference, results);
	}
	return results;
};

exports.createPolygonReference = function(referencesvalues) {
	var result = [];
	for (var j=0, tot=referencesvalues.length; j<tot; j++) {
		result.push(referencesvalues[j] + "#position");
	}
	return result;
};

exports.createPolygon = function(id, name, description, colorvalue, extrudeheight, referencesvalues, results) {
	var line = {};
	line.id = id;
	line.name = name;
	line.description = description;
	var polygon = {};
	polygon.followSurface = true;
	var rgba = {};
	rgba.rgba = colorvalue;
	var solidColor = {};
	solidColor.color = rgba;
	var material = {};
	material.solidColor = solidColor;
	polygon.material = material;
	var references = {};
	references.references = referencesvalues;
	polygon.positions = references;
	polygon.fill = true;
	polygon.extrudedHeight = extrudeheight;
	//polygon["outline"] = true;
	//polygon["outlineColor"] = rgba;
	line.polygon = polygon;
	results.push(line);
	return results;
};

exports.createPolygonCarto = function(id, name, description, colorvalue, extrudeheight, referencesvalues, results) {
	var line = {};
	line.id = id;
	line.name = name;
	line.description = description;
	var polygon = {};
	polygon.followSurface = true;
	var rgba = {};
	rgba.rgba = colorvalue;
	var solidColor = {};
	solidColor.color = rgba;
	var material = {};
	material.solidColor = solidColor;
	polygon.material = material;
	var carto = {};
	carto.cartographicDegrees = referencesvalues;
	polygon.positions = carto;
	polygon.fill = true;
	polygon.extrudedHeight = extrudeheight;
	line.polygon = polygon;
	results.push(line);
	return results;
};
