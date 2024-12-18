'use strict';

exports.getHeader = async function(name) {
   let header = [];
   header.push("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
   header.push("<kml xmlns=\"http://www.opengis.net/kml/2.2\" xmlns:gx=\"http://www.google.com/kml/ext/2.2\" xmlns:kml=\"http://www.opengis.net/kml/2.2\" xmlns:atom=\"http://www.w3.org/2005/Atom\">");
   header.push("<Document>");
   header.push("   <name>" + name + "</name>");
   return header;
}

exports.getFooter = async function() {
   let footer = [];
   footer.push("</Document>");
   footer.push("</kml>");
   return footer;
}

exports.getLineStyleMap = async function(name) {
   let styleMap = []
   styleMap.push("   <StyleMap id=\"" + name + "\">");
   styleMap.push("      <Pair>");
   styleMap.push("         <key>normal</key>");
   styleMap.push("         <styleUrl>#" + name + "0</styleUrl>");
   styleMap.push("      </Pair>");
   styleMap.push("      <Pair>");
   styleMap.push("         <key>highlight</key>");
   styleMap.push("         <styleUrl>#highlight0</styleUrl>");
   styleMap.push("      </Pair>");
   styleMap.push("   </StyleMap>");
   return styleMap;
};

exports.getLineStyle = async function(name, styles) {
   let style    = []
   var rgb      = "#ff" + styles['color'].reverse().map(e=>e.toString(16).padStart(2, 0)).join("");
   var distance = styles['distance']/20000 >= 1 ? styles['distance']/20000 : 1;
   style.push("   <Style id=\"" + name + "0\">");
   style.push("      <LineStyle>");
   style.push("         <color>" + rgb + "</color>");
   style.push("         <width>" + distance + "</width>");
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

exports.getPointStyle = async function(category) {
   let style = []
   style.push("   <Style id=\"" + category + "\">");
   style.push("      <IconStyle>");
   style.push("         <Icon>");
   style.push("            <href>https://maps.leylines.net/images/icons/" + category.toLowerCase() + ".png</href>");
   style.push("         </Icon>");
   style.push("      </IconStyle>");
   style.push("   </Style>");
   return style;
};

exports.getGeometry = async function(solids, points, category, solid, type, latitude, longitude, bearing, form) {
   var kmlfile = [];
   if (type == "points") {
      let folderOpen = [];
      folderOpen.push("   <Folder>");
      folderOpen.push("      <name>" + solid.charAt(0).toUpperCase() + solid.slice(1).toLowerCase() + "</name>");
      folderOpen.push("      <description>Latitude: " + latitude + "<br/>Longitude: " + longitude + "<br/>Bearing: " + bearing + "</description>");
      let kmlPoints = await getPoints(points);
      let folderClose = [];
      folderClose.push("   </Folder>");
      kmlfile = await kmlfile.concat(folderOpen, kmlPoints, folderClose);
   } else {
      let folderOpen = [];
      folderOpen.push("   <Folder>");
      folderOpen.push("      <name>" + solid.charAt(0).toUpperCase() + solid.slice(1).toLowerCase() + " Lines</name>");
      folderOpen.push("      <description>Latitude: " + latitude + "<br/>Longitude: " + longitude + "<br/>Bearing: " + bearing + "</description>");
      let kmlLines = await getLines(solids['lines'], points, category, solid, type);
      let folderClose = [];
      folderClose.push("   </Folder>");
      kmlfile = await kmlfile.concat(folderOpen, kmlLines, folderClose);
   };
   return kmlfile;
};

exports.createPoint = async function(name, description, x_coord, y_coord, z_coord, type, kmlfile) {
   kmlfile.push("      <Placemark>");
   kmlfile.push("         <styleUrl>#" + type + "</styleUrl>");
   kmlfile.push("         <name>" + name + "</name>");
   kmlfile.push("         <description>" + description + "</description>");
   kmlfile.push("         <Point>");
   kmlfile.push("            <coordinates>");
   kmlfile.push("               " + x_coord + "," + y_coord + "," + z_coord);
   kmlfile.push("            </coordinates>");
   kmlfile.push("         </Point>");
   kmlfile.push("      </Placemark>");
   return kmlfile;
};

exports.getLine = async function(kmlfile, id, polyline, name, description, group) {
   kmlfile.push("      <Placemark>");
   kmlfile.push("         <name>" + name + "</name>");
   kmlfile.push("         <description>" + description + "</description>");
   kmlfile.push("         <styleUrl>#" + group + "</styleUrl>");
   kmlfile.push("         <LineString>");
   kmlfile.push("            <tessellate>1</tessellate>");
   kmlfile.push("            <coordinates>");
   kmlfile.push("               " + polyline.join(" "));
   kmlfile.push("            </coordinates>");
   kmlfile.push("         </LineString>");
   kmlfile.push("      </Placemark>");
   return kmlfile;
};

async function getLines(lines, points, category, solid, type) {
   let kmlLines = [];
   for (let i = 0; i < lines.length; i++) {
      kmlLines.push("      <Placemark>");
      kmlLines.push("         <name>" + lines[i][0] + " - " + lines[i][1] + "</name>");
      kmlLines.push("         <styleUrl>#" + category + "-" + solid + "-" + type + "</styleUrl>");
      kmlLines.push("         <LineString>");
      kmlLines.push("            <tessellate>1</tessellate>");
      kmlLines.push("            <coordinates>");
      kmlLines.push("               " + Number(points[lines[i][0]][1]) + "," + Number(points[lines[i][0]][2]) + " " + Number(points[lines[i][1]][1]) + "," + Number(points[lines[i][1]][2]));
      kmlLines.push("            </coordinates>");
      kmlLines.push("         </LineString>");
      kmlLines.push("      </Placemark>");
   };
   return kmlLines;
};

async function getPoints(points) {
   let kmlPoints = [];
   for (let i = 0; i < points.length; i++) {
      kmlPoints.push("      <Placemark>");
      kmlPoints.push("         <name>Point " + i + "</name>");
      kmlPoints.push("         <Point>");
      kmlPoints.push("            <coordinates>");
      kmlPoints.push("               " + points[i][1] + "," + points[i][2] + ",0");
      kmlPoints.push("            </coordinates>");
      kmlPoints.push("         </Point>");
      kmlPoints.push("      </Placemark>");
   };
   return kmlPoints;
};

