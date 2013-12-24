var _ = require('underscore');
var query = require('querystring');
var format = require('format');

// jshint camelcase: false

function SignatureApiProvider () {
  // letsface servers from https://github.com/letsface/signature-cluster/wiki/API
  var config = {
      hosts: []
  };

  this.hosts = function (hosts) {
    config.hosts = hosts;
  };

  this.$get = function ($http, $timeout, controlPanel) {
    var defaultOpts = {
      count: 10,
      offset: 0,
      server: 'lfprod'
    };

    var ctx = {
      server: config.hosts[0].address || 'N/A',
      hosts: config.hosts,
      eventId: 118,
      pollInterval: 1000
    };

    var stat = {};// service stat such as last_id;
    var server;
    var events = {};
    var init = false;
    var timer;

    /*
     * List signatures
     *
     * @param {String} host host name
     * @param {Object} opts override default options
     * @param {Function} success callback when success
     * @param {Function} error callback when error
     *
     * Example signatureService.list(successFn, errorFn);
     */
    function list(host, opts, success, error) {

      if (typeof host === 'object') {
        error = success;
        success = opts;
        opts = host;
        host = undefined;
      } else if (typeof host === 'function') {
        error = opts;
        success = host;
        opts = undefined;
        host = undefined;
      }

      var server = host || ctx.server;
      if (!server) {
        return;
      }

      opts = opts || {};
      _.defaults(opts, defaultOpts);

      //var url = format('%s/?%s', server, query.stringify(opts));
      var path = format('/signatures/%d/', ctx.eventId);
      var url = format('%s%s?%s', server, path, query.stringify(opts));

      $http.get(url)
             .error(error || function () {})
             .success(function (data) {
               /*
                *  data format from https://github.com/letsface/signature-cluster/wiki/API
                *
[{
"id":"1241",
"orig_filename":"signatures/1/1.png",
"trans_filename":"signatures/1/1.png",
"signature":"2013-11-09 07:23:56",
"directory":"1"
},{
"id":"1242",
"orig_filename":"signatures/1/2.png",
"trans_filename":"signatures/1/2.png",
"signature":"2013-11-09 07:25:28",
"directory":"1"
}]

access url

http://backend.addr/hphoto/signatures/1/1.png
                */
               // format result for signature cloud
               sigs = data.signatures;
               data = sigs.map(function (d) {
                 return {
                   id: d.id,
                   //href: format('%s/hphoto/%s', server, d.trans_filename),
                   href: d.filepath,
                   timestamp: d.timestamp
                 };
               });
               if (data.length) {
                 stat.lastId = data[data.length - 1].id;
               }
               if (success) {
                 success(data);
               }
             });
    }

    /* submit signature to backend */
    function add() {
      console.log("signature added to backend");
    }

    /* get update since last query */
    function update(success, error) {
      var opts = {};
      if (stat.lastId) {
        opts.offset = stat.lastId;
      }
      return list(opts, success, error);
    }

    function on(event, fn) {
      events[event] = fn;
    }

    function poll() {
      if (!init) {
        init = true;
        list(events.data);
      } else {
        update(events.data);
      }
      timer = $timeout(poll, ctx.pollInterval);
    }

    function reset() {
      init = false;
      $timeout.cancel(timer);
      events = {};
    }

    function option(opts) {
      _.extend(ctx, opts);
    }

    controlPanel.add('api', 'glyphicon-signal', require('./panel.html'), ctx);
    reset();

    return {
      on: on,
      config: option,
      list: list,
      update: update,
      add: add,
      poll: poll,
      reset: reset
    };
  };
}

exports = module.exports = angular.module('letsface/signatureApiLegacy', [
    require('control-panel-for-angular').name
  ])
  .provider('signatureApi', SignatureApiProvider);
