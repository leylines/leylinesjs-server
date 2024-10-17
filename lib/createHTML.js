'use strict';

exports.createFeatureInfo = function(row, imagetype) {

   var utils = require('./utils');

   var image;
   var imagealt;
   var wikipedialink;

   if (!row.description) {
      row.description = row.site;
   }
   if (row.site) {
      wikipedialink = "<a href=\"https://en.wikipedia.org/wiki/" + row.site.replace(/ /g, "_") + "\">" + row.site + "</a>";
   } 
   if (row.image) {
      image = row.image;
      imagealt = row.website;
   } else  {
      image = "/popup/" + row.site.replace(/ /g, "_") + ".jpg";
      imagealt = row.site;
   }

   var description = "<!--HTML-->\r\n<p>\r\n";
   description += "<table>";
      
   if (row.image) {
      description += "<tr><td colspan=\"2\"><img src=\"" + image + "\" alt=\"" + imagealt + "\" style=\"width:360px\" /></td></tr>";
   } else if (utils.fileExists(image)) {
      if (imagetype == "external") {
         description += "<tr><td colspan=\"2\"><img src=\"https://maps.leylines.net/images" + image + "\" alt=\"" + imagealt + "\" style=\"width:360px\" /></td></tr>";
      } else {
         description += "<tr><td colspan=\"2\"><img src=\"/images" + image + "\" alt=\"" + imagealt + "\" style=\"width:360px\" /></td></tr>";
      }
   }

   description += "<tr><td style=\"width: 360px; padding: 4px\" colspan=\"2\">" + row.description + "</td></tr>";

   if (row.type && row.type != "unknown") {
      description += "<tr><td style=\"width: 120px; padding: 4px\">Type:</td><td style=\"width: 240px\">" + row.type + "</td></tr>";
   }
   if (row.sub_type && row.sub_type != "unknown") {
      description += "<tr><td style=\"width: 120px; padding: 4px\">Subtype:</td><td style=\"width: 240px\">" + row.sub_type + "</td></tr>";
   }
   if (row.site) {
      description += "<tr><td style=\"width: 120px; padding: 4px\">Wikipedia:</td><td style=\"width: 240px\">" + wikipedialink + "</td></tr>";
   }
   if (row.data_owner) {
      description += "<tr><td style=\"width: 120px; padding: 4px\">Custodian:</td><td style=\"width: 240px\">" + row.data_owner + "</td></tr>";
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
   description += "\r\n</p>";

   return description;
};

