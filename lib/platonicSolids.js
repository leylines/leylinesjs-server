'use strict';

exports.rotateZ = function(param, thetaZ) {
	var i, tot;
	for (i=0, tot=param.length; i<tot; i++) {
	        var x = param[i][0];
	        var y = param[i][1];
	        var z = param[i][2];

	        param[i][0] = x*Math.cos(thetaZ)-y*Math.sin(thetaZ);
	        param[i][1] = x*Math.sin(thetaZ)+y*Math.cos(thetaZ);
	        param[i][2] = z;
	}
	return param;
};

exports.rotateX = function(param, thetaX) {
	var i, tot;
	for (i=0, tot=param.length; i<tot; i++) {
	        var x = param[i][0];
	        var y = param[i][1];
	        var z = param[i][2];

		param[i][0] = x;
		param[i][1] = y*Math.cos(thetaX)-z*Math.sin(thetaX);
		param[i][2] = y*Math.sin(thetaX)+z*Math.cos(thetaX);
	}
	return param;
};

exports.rotateY = function(param, thetaY) {
	var i, tot;
	for (i=0, tot=param.length; i<tot; i++) {
	        var x = param[i][0];
	        var y = param[i][1];
	        var z = param[i][2];

		param[i][0] = x*Math.cos(thetaY)+z*Math.sin(thetaY);
		param[i][1] = y;
		param[i][2] = -x*Math.sin(thetaY)+z*Math.cos(thetaY);
	}
	return param;
};

//exports.bearing = function(lat1,lon1,lat2,lon2,thetaY) {
exports.bearing = function(lat1,lon1,lat2,lon2) {

	var math = require('./Math.js');

	lat1 = math.radians(lat1);
	lon1 = math.radians(lon1);
	lat2 = math.radians(lat2);
	lon2 = math.radians(lon2);

        var thetaY = Math.acos(Math.sqrt((5.0+Math.sqrt(5.0))/10.0))
	//var thetaY = math.radians(31.717474);

	var y = Math.sin(lon2-lon1)*Math.cos(lat2);
	var x = Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1);

	if (y>0) {
		if (x>0) {
			thetaY = Math.atan(y/x);
		} else if (x<0) {
			thetaY = -Math.PI-Math.atan(-y/x);
		} else {
			thetaY = Math.PI/2;
		}
	} else if (y<0) {
		if (x>0) {
			thetaY = -Math.atan(-y/x);
		} else if (x<0) {
			thetaY = Math.atan(y/x)+Math.PI;
		} else {
			thetaY = Math.PI*3/2;
		}
	} else {
		if (x>0) {
			thetaY = 0;
		} else if (x<0) {
			thetaY = -Math.PI;
		} else {
			thetaY = 0;
		}
	}
	//return thetaY

        var bearing = Math.atan2( Math.sin(lon2-lon1) * Math.cos(lat2), Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1));
        return -bearing;

};

exports.coordinates = function(param, results) {

	var math = require('./Math.js');
	var i, tot;

	for (i=0, tot=param.length; i<tot; i++) {
	        var x = param[i][0];
	        var y = param[i][1];
	        var z = param[i][2];

		var theta = 0;
		var phi = 0;
		if (z < 0) {
			theta = Math.PI+Math.atan(Math.sqrt(x*x+y*y)/z);
		} else if (z===0) {
			theta = Math.Pi/2;
		} else {
			theta = Math.atan(Math.sqrt(x*x+y*y)/z);
		}

		if (x < 0 && y !== 0) {
			phi=Math.PI+Math.atan(y/x);
		} else if (x === 0 && y > 0) {
			phi=Math.PI/2;
		} else if (x === 0 && y < 0) {
			phi=Math.PI*3/2;
		} else if (y === 0 && x > 0) {
			phi=0;
		} else if (y === 0 && x < 0) {
			phi=Math.PI;	
		} else if (x > 0 && y <= 0) {
			phi = 2*Math.PI+Math.atan(y/x);
		} else if (x === 0 && y === 0)  {
			phi = 888;
		} else {
			phi=Math.atan(y/x);
		}

		param[i][0] = theta;
		param[i][1] = phi;
		delete param[i][2];

		theta = math.degrees(theta);
		phi = math.degrees(phi);
		var longitude;

		var latitude = 90.0-theta;
		if (phi <= 180.0) {
			longitude = phi;
		} else {
			longitude = phi-360.0;
		}

		if (longitude > 600) {
			longitude = 0.0;
		}

		//results.push(i + "|" + longitude + "|" + latitude + "|" + i);
		results.push([i,longitude,latitude,i]);
	}
	return results;
};

exports.getShapePoints = function(shapename) {

	var shapepoints = {};

	var p = (1+Math.sqrt(5.0))/2.0;
   
        var x = 0;
        shapepoints.vyncent = [];
        while (x < 16) {
            var xx = Math.PI/8.0*x;
            var y = 0;
            while (y < 16) {
              var yy = Math.PI/8.0*y; 
              shapepoints.vyncent.push([Math.sin(yy)*Math.cos(xx),Math.sin(yy)*Math.sin(xx),Math.cos(yy)]);
              y++;
            }
            x++;
        }

	shapepoints.dodecahedron = [[0,1/p,p],[0,-1/p,-p],[0,-1/p,p],[0,1/p,-p],[1/p,p,0],[-1/p,-p,0],[-1/p,p,0],[1/p,-p,0],[p,0,1/p],[-p,0,-1/p],[-p,0,1/p],[p,0,-1/p],[1,1,1],[-1,-1,-1],[-1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1],[1,-1,1],[1,1,-1]];
	shapepoints.icosahedron = [[0,1,p],[0,-1,-p],[0,-1,p],[0,1,-p],[1,p,0],[-1,-p,0],[-1,p,0],[1,-p,0],[p,0,1],[-p,0,-1],[-p,0,1],[p,0,-1]];
	shapepoints.cube = [[1,1,1],[-1,-1,-1],[-1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1],[1,-1,1],[1,1,-1]];
	shapepoints.tetrahedron = [[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]];
	shapepoints.octahedron = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
        //shapepoints.vyncent = [[1,0,0],[Math.cos(Math.PI/8),Math.sin(Math.PI/8),0],[Math.cos(Math.PI/4),Math.sin(Math.PI/4),0],[Math.cos((Math.PI/8)*3),Math.sin((Math.PI/8)*3),0],[Math.cos(Math.PI/2),Math.sin(Math.PI/2),0],[Math.cos(Math.PI/1.6),Math.sin(Math.PI/1.6),0],[Math.cos((Math.PI/8)*6),Math.sin((Math.PI/8)*6),0],[Math.cos((Math.PI/7)*6),Math.sin((Math.PI/8)*7),0],[-1,0,0]];
        //shapepoints.vyncent = [[1,0,0],[Math.sin(Math.PI/16),Math.cos(Math.PI/16),0],[Math.sin(45.0),Math.cos(45.0),0],[Math.sin(67.5),Math.cos(67.5),0],[Math.sin(90.0),Math.cos(90.0),0],[Math.sin(112.5),Math.cos(112.5),0],[Math.sin(135.0),Math.cos(135.0),0],[Math.sin(157.5),Math.cos(157.5),0],[-1,0,0]];
	shapepoints.beckerhagens = [[0,1/p,p],[0,-1/p,-p],[0,-1/p,p],[0,1/p,-p],[1/p,p,0],[-1/p,-p,0],[-1/p,p,0],[1/p,-p,0],[p,0,1/p],[-p,0,-1/p],[-p,0,1/p],[p,0,-1/p],[1,1,1],[-1,-1,-1],[-1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1],[1,-1,1],[1,1,-1],[0,-p,1],[0,p,-1],[0,-p,-1],[0,p,1],[1,0,p],[-1,0,-p],[-1,0,p],[1,0,-p],[p,-1,0],[-p,1,0],[-p,-1,0],[p,1,0],[2,0,0],[-2,0,0],[0,2,0],[0,-2,0],[0,0,2],[0,0,-2],[p,1/p,1],[-p,-1/p,-1],[-p,-1/p,1],[-p,1/p,-1],[p,-1/p,-1],[p,-1/p,1],[p,1/p,-1],[-p,1/p,1],[1,p,1/p],[-1,-p,-1/p],[-1,-p,1/p],[-1,p,-1/p],[1,-p,-1/p],[1,-p,1/p],[1,p,-1/p],[-1,p,1/p],[1/p,1,p],[-1/p,-1,-p],[-1/p,-1,p],[-1/p,1,-p],[1/p,-1,-p],[1/p,-1,p],[1/p,1,-p],[-1/p,1,p]];

	var shape = shapepoints[shapename];
	return shape;
};

exports.calculateGridPoints = function(lat1, lon1, azi, shapename) {

	var math = require('./Math.js');
	var results = [];

	var thetaX;
	var thetaY;
	var thetaZ;

	// get shape
	var shape = exports.getShapePoints(shapename);

	// default the vertex of a shape toward true north
        thetaY = Math.acos(Math.sqrt((3.0+Math.sqrt(5.0))/6.0))
	//thetaY = math.radians(20.9051574479);
	thetaX = math.radians(180.0);

	if (shapename == "dodecahedron") {
		shape = exports.rotateX(exports.rotateY(shape, thetaY), thetaX);
	}
	
	if (shapename == "beckerhagens") {
		shape = exports.rotateX(exports.rotateY(shape, thetaY), thetaX);
	}

        thetaY = Math.acos(Math.sqrt(6.0)/3.0);
	//thetaY = math.radians(35.26439);
	thetaZ = math.radians(-45.0);
	thetaX = math.radians(180.0);

	if (shapename == "tetrahedron") {
		shape = exports.rotateY(exports.rotateZ(shape, thetaZ), thetaY);
	}

	if (shapename == "cube") {
		shape = exports.rotateX(exports.rotateY(exports.rotateZ(shape, thetaZ), thetaY), thetaX);
	}

        thetaY = Math.acos(Math.sqrt((5.0+Math.sqrt(5.0))/10.0))
	//thetaY = math.radians(31.717474);

	if (shapename == "icosahedron") {
		shape = exports.rotateX(exports.rotateY(shape, thetaY), thetaX);
	}

	// set rotational angles
	thetaX = azi; 
	thetaZ = math.radians(lon1);
	thetaY = -math.radians(lat1);

	results = exports.coordinates(exports.rotateZ(exports.rotateY(exports.rotateX(shape, thetaX), thetaY), thetaZ), results);
	return results;

};

exports.calculateGridLines = function(param, level) {

	var results = [];

	var x = 0;
	var z = 1;
	var smallest = 91;

	while (x < param.length) {
		while (z < param.length) {
                        console.log(param[x]);
                        console.log(param[z]);
			var xcoord = param[x].split("|"); 
			var zcoord = param[z].split("|"); 
			x = xcoord[0];
			z = zcoord[0];
			var a = xcoord[1];
			var b = xcoord[2];
			var c = zcoord[1];
			var d = zcoord[2];
			var separation = Math.acos(Math.sin(b*0.01744)*Math.sin(d*0.01744)+Math.cos(b*0.01744)*Math.cos(d*0.01744)*Math.cos(a*0.01744-c*0.01744))/0.01744;
			if (separation < 50 && level == 1) {
				results.push(x + "|" + z + "|" + a + "|" + b + "|" + c + "|" + d + "|" + separation);
				//results.push([x,z,a,b,c,d,separation]);
			} else if (separation >= 50 && separation < 61 && level == 2) {
				results.push(x + "|" + z + "|" + a + "|" + b + "|" + c + "|" + d + "|" + separation);
				//results.push([x,z,a,b,c,d,separation]);
			} else if (separation >= 61 && separation < 64 && level == 3) {
				results.push(x + "|" + z + "|" + a + "|" + b + "|" + c + "|" + d + "|" + separation);
				//results.push([x,z,a,b,c,d,separation]);
			} else if (separation < smallest && level == 4) {
				results.push(x + "|" + z + "|" + a + "|" + b + "|" + c + "|" + d + "|" + separation);
				//results.push([x,z,a,b,c,d,separation]);
			}
			z++;
		}
		z = Number(x) + 2;
		x++;
	}

	return results;
};
