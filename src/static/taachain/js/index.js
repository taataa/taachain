(function () {

// state, current taa
// get initial taa from model, add it and its children to view.
// attach to children that if they are pressed, transfer to the child.
// send transfer to the model.

var taachain = {};

taachain.view = (function () {
  var exports = {};
  /////////////////

  var parentContainer = jQuery('.parent');
  var childrenContainer = jQuery('.children');

  exports.addParent = function (taaModel, onTap) {
    //   img at the top of the page
    var img = document.createElement('img');
    img.setAttribute('src', taaModel.uri);
    parentContainer.append(img);
    jQuery(img).click(onTap);
  };

  exports.addChild = function (taaModel, taaProb, onTap) {
    //   img at elem under parent, children in a horizontal row.
    var img = document.createElement('img');
    img.setAttribute('src', taaModel.uri);
    childrenContainer.append(img);
    jQuery(img).click(onTap);
    //jQuery(img).css('opacity', taaProb);
    jQuery(img).css('width', 256 * taaProb);
    jQuery(img).css('height', 256 * taaProb);
  };

  exports.clear = function () {
    //   remove parent and children
    parentContainer.empty();
    childrenContainer.empty();
  };

  ///////////////
  return exports;
}());

taachain.model = (function () {
  var exports = {};
  /////////////////

  exports.get = function (taakey, callback) {
    //   get from /api/taa/<taakey>
    var url = '/api/taa/' + taakey;
    jQuery.getJSON(url, function success(response) {
      callback(response);
    });
  };

  exports.transfer = function (source, target, callback) {
    //   push to server /api/event/
    var url = '/api/event';
    var transferDescriptor = {
      source: source,
      target: target
    };
    jQuery.post(url, transferDescriptor, function success() {
      callback();
    });
  };

  ///////////////
  return exports;
}());
  
taachain.ctrl = (function () {
  var exports = {};
  /////////////////

  var model = taachain.model;
  var view = taachain.view;

  var currentTaaKey = null;

  var distSum = function (dist) {
    var i, s;
    s = 0;
    for (i = 0; i < dist.length; i += 2) {
      s += parseFloat(dist[i + 1]);
    }
    return s;
  };

  var transfer = function (targetTaaKey) {
    model.get(targetTaaKey, function then(targetTaaModel) {
      view.clear();

      view.addParent(targetTaaModel, function onTap() {
        // nothing
      });

      var i, d, viewChild, childTaaKey, sum;
      d = targetTaaModel.dist;
      sum = distSum(d);

      viewChild = function (childTaaKey, childTaaProb) {
        model.get(childTaaKey, function (childTaaModel) {
          view.addChild(childTaaModel, childTaaProb, function onTap() {
            transfer(childTaaModel.key);
          });
        });
      };

      for (var i = 0; i < d.length; i += 2) {
        childTaaKey = d[i];
        childTaaProb = parseFloat(d[i + 1]) / sum;
        viewChild(childTaaKey, childTaaProb);
      }
    });

    if (currentTaaKey !== null) {
      model.transfer(currentTaaKey, targetTaaKey, function success() {
        // nothing
      });
    }

    // Change state
    currentTaaKey = targetTaaKey;
  };

  exports.init = function (defaultTaaKey) {
    transfer(defaultTaaKey);
  };

  ///////////////
  return exports;
}());

taachain.ctrl.init('example');

}());


