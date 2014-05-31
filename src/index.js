'use strict';



// Settings
// ===========
var settings = {
  port: 8888,
  redis: {
    port: 6379,
    host: '127.0.0.1',
    database: 0 // Database index
  },
  static: {
    url: '/static',
    path: __dirname + '/static'
  },
  media: {
    url: '/media',
    path: __dirname + '/media',
    temppath: __dirname + '/temp',
    maxage: 86400000 
  }
};



// Setup
// ============

// Express specific includes
var express = require('express');
var bodyParser = require('body-parser')
var app = express();

// Application specific (i.e. custom) includes
var redis = require('./redis');
var moment = require('moment');

// Express framework configuration
app.set('view engine', 'jade');
app.set('views', __dirname + '/templates');
app.enable('strict routing');

// Serve static files, like JS and CSS
app.use(settings.static.url, express.static(settings.static.path));

// Serve user content, like tiles and taas.
// About Cache-Control, see
//     http://blog.modulus.io/nodejs-and-express-static-content
app.use(
    settings.media.url,
    express.static(settings.media.path, {maxAge: settings.media.maxage})
);

// Form parsing middleware.
app.use(bodyParser.urlencoded());


// Handlers (i.e. logic)
// =====================

app.get('/', function (req, res) {
  res.render('index', {});
});

app.get('/api/taa/:key', function (req, res) {
  // get api/taa/<taa key>

  // key
  // url
  // dist
  //   key: pr,
  //   key: pr

  // Redis

  // GET taa/1a23/img
  //   123.jpg
  // ZRANGE taa/1a23/dist
  //   2b3, 30, 34c5, 8, 3d33, 2

  var taakey = req.params.key;
  var urikey = 'taa/' + taakey + '/uri';
  var distkey = 'taa/' + taakey + '/dist';

  redis.get(urikey, function (err, taauri) {
    if (err) {
      console.log('redis get error');
      res.send(500, 'Redis get error');
      return;
    } // else

    redis.zrevrange(distkey, 0, -1, 'WITHSCORES', function cb(err, taadist) {
      if (err) {
        console.log('redis zrange error');
        res.send(500, 'Redis zrange error');
        return;
      } // else

      res.json(200, {
        key: taakey,
        uri: taauri,
        dist: taadist
      });
    });
  });

  // res.json(200, {
  //   key: req.params.key,
  //   uri: '/media/taa/example.jpg',
  //   dist: ['2': 4, '3': 3, '6': 1]
  // });
});

app.post('/api/event', function (req, res) {
  // post api/event/

  // source
  //   1a23
  // target
  //   2b3

  var source = req.param('source');
  var target = req.param('target');

  var distKey = 'taa/' + source + '/dist';
  var query = '';

  redis.zincrby(distKey, 1, target, function cb(err, reply) {
    if (err) {
      res.send(500, 'Redis zincrby error');
      return;
    } // else

    res.send(200, source + ' ' + target);
  });
});



// Start service
// =============
app.listen(settings.port);
(function display_start_message() {
    var t = moment.utc().format('YYYY-MM-DD HH:mm:ss [GMT]');
    console.log(t, 'Listening on port', settings.port);
}());
