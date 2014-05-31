/* jslint node: true */
'use strict';

// 
// Redis Database Client Wrapper
// for Redis commands not related
// to publish/subscribe. For publish/subscribe
// see subscriber.js.
//
// Optional settings and defaults
//     see settingsloader.js
//
// Usage example
//     
//     var redis = require('./redis');
//     redis.mget(...);
// 

var settings = require('./settingsloader');
var redis = require('redis');

var db = redis.createClient(settings.port, settings.host);

// Select the database. It might be that there is multiple
// databases on a single redis instance.
db.select(settings.database, function (err) {
    if (err) {
        console.log('Redis error on database selection:');
        console.log(err);
        return;
    }
});

// Handle Database Errors
db.on('error', function (err) {
    console.log('Redis error:');
    console.log(err);
});

module.exports = db;
