'use strict';

exports.createPoints = async function(czmlfile, points, showicon, color) {
   var czml = require('./createCzml.js');
   var icon;
   var scale;
   for (var i=0, tot=points.length; i<tot; i++) {
      if (showicon) {
         icon = "/images/icons/button_" + color[0] + "-" + color[1] + "-" + color[2] + ".svg";
         scale = 0.05;
      } else  {
         icon = "";
         scale = 1;
      }
      czmlfile = czml.createPoint(points[i][0], points[i][3], points[i][3], icon, scale, Number(points[i][1]), Number(points[i][2]), 1000, czmlfile);
   }
   return(czmlfile);
};

exports.createGisCorridor = async function(czmlfile, id, polyline, name, description, distance, color) {

   var czml = require('./createCzml');

   var linewidth = distance * 2;
   color[3] = 64;
   czmlfile = await czml.createCorridorCarto(`${id}c`, name, description, linewidth, color, polyline, czmlfile);
   czmlfile = await czml.createPolylineCarto(`${id}p`, name, description, 3, color, polyline, czmlfile);
   return(czmlfile);
};

exports.createCorridor = async function(czmlfile, points, lines, distance, color) {
  const czml = require('./createCzml');
  const html = require('./createHTML');

  const linewidth = distance * 2;
  for (const [start, end] of lines) {
    const startPoint = Number(start) + 1;
    const endPoint = Number(end) + 1;
    const info = {
      name: `${startPoint}-${endPoint}`,
      description: `${startPoint}:<br/>Longitude: ${points[start][1]}<br/>Latitude: ${points[start][2]}<br/>${endPoint}:<br/>Longitude: ${points[end][1]}<br/>Latitude: ${points[end][2]}`
    };
    const description = html.createFeatureInfo(info, "line", "internal");
    const referencesvalues = [
      points[start][1], points[start][2], 0,
      points[end][1], points[end][2], 0
    ];
    color[3] = 64;
    czmlfile = await czml.createCorridorCarto(`${info.name}c`, info.name, description, linewidth, color, referencesvalues, czmlfile);
    czmlfile = await czml.createPolylineCarto(`${info.name}p`, info.name, description, 3, color, referencesvalues, czmlfile);
  }
  return czmlfile;
};

exports.createArea = function(czmlfile, polygons) {

   var czml = require('./createCzml');
   var polygonid;
   var extrudeheight = 10000;
   var polygonreference = [];

   for (var i=0, tot1=polygons.length; i<tot1; i++) {
      for (var j=0, tot2=polygons[i][0].length; j<tot2; j++) {
         polygonreference = czml.createPolygonReference(polygons[i][0][j]);
         polygonid = polygons[i][0][j].join("-");
         czmlfile = czml.createPolygon(polygonid, polygonid, polygonid, polygons[i][1], extrudeheight, polygonreference, czmlfile);
      }
   }
   return(czmlfile);
}
