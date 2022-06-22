'use strict';
// Converts from degrees to radians.
exports.radians = function(degrees) {
	return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
exports.degrees = function(radians) {
	return radians * 180 / Math.PI;
};

