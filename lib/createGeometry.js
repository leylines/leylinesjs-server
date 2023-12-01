'use strict';

exports.createPoints = function(res, points, showicon, color, czmlfile) {

   var czml = require('./createCzml.js');
   var icon;
   var scale;

   for (var i=0, tot=points.length; i<tot; i++) {
      if (showicon) {
         icon = "/images/icons/button_" + color[0] + "-" + color[1] + "-" + color[2] + ".svg";
         //icon = "/images/icons/button_yellow.png";
         scale = 0.05;
      } else  {
         icon = "";
         scale = 1;
      }

      czmlfile = czml.createPoint(points[i][0], points[i][3], points[i][3], icon, scale, Number(points[i][1]), Number(points[i][2]), 1000, czmlfile);
   }
   return(czmlfile);

};

exports.createGisCorridor = async function(res, lines, distance, color, czmlfile) {

   var czml = require('./createCzml');
   var linewidth = distance * 2;

   for (var i=0, tot=lines.length; i<tot; i++) {
        
      var referencesvalues = [];

      //console.log(lines[i][2]);
      for (var j=0, subtot=lines[i][1].length; j<subtot; j++) {
        referencesvalues.push(lines[i][1][j][0]);
        referencesvalues.push(lines[i][1][j][1]);
        referencesvalues.push(Number(0));
      }

      color[3] = 64;
      czmlfile = await czml.createCorridorCarto(lines[i][2] + "c", lines[i][2], lines[i][3], linewidth, color, referencesvalues, czmlfile);
      czmlfile = await czml.createPolylineCarto(lines[i][2] + "p", lines[i][2], lines[i][2], 3, color, referencesvalues, czmlfile);
   }
   //res.send(czmlfile);
   return czmlfile;

};

exports.createCorridor = async function(res, points, lines, distance, color, czmlfile) {

   var czml = require('./createCzml');
   var linewidth = distance * 2;

   for (var i=0, tot=lines.length; i<tot; i++) {
        
      var referencesvalues = [];

      var name = lines[i][0] + "-" + lines[i][1];
      referencesvalues.push(points[lines[i][0]][1]);
      referencesvalues.push(points[lines[i][0]][2]);
      referencesvalues.push(Number(0));

      referencesvalues.push(points[lines[i][1]][1]);
      referencesvalues.push(points[lines[i][1]][2]);
      referencesvalues.push(Number(0));

      color[3] = 64;
      czmlfile = await czml.createCorridorCarto(name + "c", name, name, linewidth, color, referencesvalues, czmlfile);
      czmlfile = await czml.createPolylineCarto(name + "p", name, name, 3, color, referencesvalues, czmlfile);
   }

   return czmlfile;

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
