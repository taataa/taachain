/* jslint node: true */
'use strict';

// Tries to load settings from the parent directory.
//
// Recognized settings
//     ../settings.js
//         redis.port ; network port, number
//         redis.host ; domain, string
//         redis.database ; sub database, number

var settings;
try {
    settings = require('../settings');
} catch (e) {
    settings = {};
}

// Defaults
var setup = {
    port: 6379,
    host: '127.0.0.1',
    database: 0
};

// Extend
if (settings.hasOwnProperty('redis')) {
    for (var a in settings.redis) { setup[a] = settings.redis[a]; }
}

module.exports = setup;
