/* jslint node: true */
"use strict";

// 
// Redis Subscriber
// 
// Subscribed clients can't call other commands.
//
// Optional settings and defaults
//     see settingsloader.js
// 

var settings = require('./settingsloader');
var redis = require('redis');

var db = redis.createClient(settings.port, settings.host);

// Select the database. It might be that there is multiple
// databases on a single redis instance.
db.select(settings.database, function (err) {
    if (err) {
        console.log(err);
        return;
    }
});

// Handle Database Errors
db.on('error', function(err) {
    console.log('Redis subscriber error: ' + err);
});


module.exports = db;
