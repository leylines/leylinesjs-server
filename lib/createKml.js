'use strict';

exports.getHeader = async function(category, solid) {
   let header = [];
   header.push("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
   header.push("<kml xmlns=\"http://www.opengis.net/kml/2.2\" xmlns:gx=\"http://www.google.com/kml/ext/2.2\" xmlns:kml=\"http://www.opengis.net/kml/2.2\" xmlns:atom=\"http://www.w3.org/2005/Atom\">");
   header.push("<Document>");
   header.push("   <name>" + category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() + " " + solid.charAt(0).toUpperCase() + solid.slice(1).toLowerCase() + "</name>");
   return header;
}

exports.getFooter = async function() {
   let footer = [];
   footer.push("</Document>");
   footer.push("</kml>");
   return footer;
}

exports.getStyleMap = async function(category, solid, type) {
   let styleMap = []
   styleMap.push("   <StyleMap id=\"" + category + "-" + solid + "-" + type + "\">");
   styleMap.push("      <Pair>");
   styleMap.push("         <key>normal</key>");
   styleMap.push("         <styleUrl>#" + category + "-" + solid + "-" + type + "0</styleUrl>");
   styleMap.push("      </Pair>");
   styleMap.push("      <Pair>");
   styleMap.push("         <key>highlight</key>");
   styleMap.push("         <styleUrl>#highlight0</styleUrl>");
   styleMap.push("      </Pair>");
   styleMap.push("   </StyleMap>");
   return styleMap;
};

exports.getStyle = async function(solids, category, solid, type, styles) {
   let style = []
   var rgb = "#ff" + solids['color'].reverse().map(e=>e.toString(16).padStart(2, 0)).join("");
   style.push("   <Style id=\"" + category + "-" + solid + "-" + type + "0\">");
   style.push("      <LineStyle>");
   style.push("         <color>" + rgb + "</color>");
   style.push("         <width>" + solids['distance']/20000 + "</width>");
   style.push("      </LineStyle>");
   style.push("   </Style>");
   style.push("   <Style id=\"highlight0\">");
   style.push("      <LineStyle>");
   style.push("         <color>" + styles['highlight']['color'] + "</color>");
   style.push("         <width>" + styles['highlight']['width'] + "</width>");
   style.push("      </LineStyle>");
   style.push("   </Style>");
   return style;
};

exports.getGeometry = async function(solids, points, category, solid, type, latitude, longitude, bearing, form) {
   var geometry = [];
   if (type == "points") {
      let newPoints = await getPoints(points, solid, latitude, longitude, bearing);
      geometry = await geometry.concat(newPoints);
   } else {
      let newLines = await getLines(solids['lines'], points, category, solid, type, latitude, longitude, bearing);
      geometry = await geometry.concat(newLines);
   };
   return geometry;
};

async function getLines(lines, points, category, solid, type, latitude, longitude, bearing) {
   let lineStrings = [];
   lineStrings.push("   <Folder>");
   lineStrings.push("      <name>" + solid.charAt(0).toUpperCase() + solid.slice(1).toLowerCase() + " Lines</name>");
   lineStrings.push("      <description>Latitude: " + latitude + "<br/>Longitude: " + longitude + "<br/>Bearing: " + bearing + "</description>");
   for (let i = 0; i < lines.length; i++) {
      lineStrings.push("      <Placemark>");
      lineStrings.push("         <name>" + lines[i][0] + " - " + lines[i][1] + "</name>");
      lineStrings.push("         <styleUrl>#" + category + "-" + solid + "-" + type + "</styleUrl>");
      lineStrings.push("         <LineString>");
      lineStrings.push("            <tessellate>1</tessellate>");
      lineStrings.push("            <coordinates>");
      lineStrings.push("               " + Number(points[lines[i][0]][1]) + "," + Number(points[lines[i][0]][2]) + " " + Number(points[lines[i][1]][1]) + "," + Number(points[lines[i][1]][2]));
      lineStrings.push("            </coordinates>");
      lineStrings.push("         </LineString>");
      lineStrings.push("      </Placemark>");
   };
   lineStrings.push("   </Folder>");
   return lineStrings;
};

async function getPoints(points, solid, latitude, longitude, bearing) {
   let pointString = [];
   pointString.push("   <Folder>");
   pointString.push("      <name>" + solid.charAt(0).toUpperCase() + solid.slice(1).toLowerCase() + "</name>");
   pointString.push("      <description>Latitude: " + latitude + "<br/>Longitude: " + longitude + "<br/>Bearing: " + bearing + "</description>");
   for (let i = 0; i < points.length; i++) {
      pointString.push("      <Placemark>");
      pointString.push("         <name>Point " + i + "</name>");
      pointString.push("         <Point>");
      pointString.push("            <coordinates>");
      pointString.push("               " + points[i][1] + "," + points[i][2] + ",0");
      pointString.push("            </coordinates>");
      pointString.push("         </Point>");
      pointString.push("      </Placemark>");
   };
   pointString.push("   </Folder>");
   return pointString;
};
