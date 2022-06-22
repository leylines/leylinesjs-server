exports.fileExists =  function(filename) {
    var fs = require('fs');
    var path = require('path');
    var dir =  path.resolve('wwwroot/images');
    var file = dir + filename;

    if (fs.existsSync(file)) {
        return 1;
    } else {
        return 0;
    }
};
