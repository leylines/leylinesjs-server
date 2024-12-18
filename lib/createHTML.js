'use strict';

exports.createFeatureInfo = function(row, rowtype, imagetype) {

   var utils = require('./utils');

   var image;
   var imagealt;
   var wikipedialink;

   if (row.name && rowtype == "poi") {
      wikipedialink = "<a href=\"https://en.wikipedia.org/wiki/" + row.name.replace(/ /g, "_") + "\">" + row.name + "</a>";
   } 
   if (row.image) {
      image = row.image;
      imagealt = row.name;
   } else if (rowtype == "poi") {
      image = "/popup/" + row.name.replace(/ /g, "_") + ".jpg";
      imagealt = row.name;
   }

   var description = "<table>";
   description += "<tr><th style=\"width: 360px\" colspan=\"2\">" + row.name + "</th></tr>";
      
   if (row.image) {
      description += "<tr><td colspan=\"2\"><img src=\"" + image + "\" alt=\"" + imagealt + "\" style=\"width:360px\" /></td></tr>";
   } else if (rowtype == "poi" && utils.fileExists(image)) {
      if (imagetype == "external") {
         description += "<tr><td colspan=\"2\"><img src=\"https://maps.leylines.net/images" + image + "\" alt=\"" + imagealt + "\" style=\"width:360px\" /></td></tr>";
      } else {
         description += "<tr><td colspan=\"2\"><img src=\"/images" + image + "\" alt=\"" + imagealt + "\" style=\"width:360px\" /></td></tr>";
      }
   }

   if (row.description) {
      description += "<tr><td style=\"width: 360px; padding: 4px\" colspan=\"2\">" + row.description + "</td></tr>";
   }
   if (row.type && row.type != "unknown") {
      description += "<tr><td style=\"width: 120px; padding: 4px\">Type:</td><td style=\"width: 240px\">" + row.type + "</td></tr>";
   }
   if (row.sub_type && row.sub_type != "unknown") {
      description += "<tr><td style=\"width: 120px; padding: 4px\">Subtype:</td><td style=\"width: 240px\">" + row.sub_type + "</td></tr>";
   }
   if (row.name && rowtype == "poi") {
      description += "<tr><td style=\"width: 120px; padding: 4px\">Wikipedia:</td><td style=\"width: 240px\">" + wikipedialink + "</td></tr>";
   }
   if (row.data_owner) {
      description += "<tr><td style=\"width: 120px; padding: 4px\">Custodian:</td><td style=\"width: 240px\"><a href='https://" + row.data_owner + "'>" + row.data_owner + "</a></td></tr>";
   }
   if (row.links) {
      var links = row.links.split('|'); 
      var linkhtml = "";
      for (var i = 0; i < links.length; i++) {
         linkhtml += "<a href=\"" + links[i] + "\">" + links[i] + "</a><br/>";
      }
      description += "<tr><td style=\"width: 120px; padding: 4px\">Links:</td><td style=\"width: 240px\">" + linkhtml + "</td></tr>";
   }
   if (row.country) {
      description += "<tr><td style=\"width: 120px; padding: 4px\">Country:</td><td style=\"width: 240px\">" + row.country + "</td></tr>";
   }

   description += "</table>";

   return description;
};

