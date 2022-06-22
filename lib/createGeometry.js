'use strict';

exports.createPoints = function(res, points, showicon, czmlfile, type) {

   var czml = require('./createCzml.js');
   var icon;
   var scale;

   for (var i=0, tot=points.length; i<tot; i++) {
      if (showicon) {
         icon = "/images/icons/button_yellow.png";
         scale = 0.1;
      } else  {
         icon = "";
         scale = 1;
      }

      var pointvalues = points[i].split('|');
      czmlfile = czml.createPoint(pointvalues[0], pointvalues[3], pointvalues[3], icon, scale, Number(pointvalues[1]), Number(pointvalues[2]), 1000, czmlfile);
   }
   return(czmlfile);

};

exports.createCorridor = function(res, points, lines, distance, color, czmlfile) {

   var czml = require('./createCzml');
   var linewidth = distance * 2;

   for (var i=0, tot=lines.length; i<tot; i++) {
        
      var referencesvalues = [];

      var pointvalues = points[lines[i][0]].split('|');
      var name = lines[i][0] + "-" + lines[i][1];
      referencesvalues.push(Number(pointvalues[1]));
      referencesvalues.push(Number(pointvalues[2]));
      referencesvalues.push(Number(0));

      pointvalues = points[lines[i][1]].split('|');
      referencesvalues.push(Number(pointvalues[1]));
      referencesvalues.push(Number(pointvalues[2]));
      referencesvalues.push(Number(0));

      color[3] = 64;
      czmlfile = czml.createCorridorCarto(name + "c", name, name, linewidth, color, referencesvalues, czmlfile);
      czmlfile = czml.createPolylineCarto(name + "p", name, name, 3, color, referencesvalues, czmlfile);
   }

   return(czmlfile);

};

exports.createArea = function(res, czmlfile, polygons, callback) {

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

   callback (null, res, czmlfile);
   return;

}
