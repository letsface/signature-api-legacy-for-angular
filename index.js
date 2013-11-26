var _ = require('underscore');
var query = require('querystring');
var format = require('format');

// jshint camelcase: false

function SignatureApiProvider () {
  // letsface servers from https://github.com/letsface/signature-cluster/wiki/API
  var hosts = {
    // 'alias': 'http://xxx.xxx.xxx.xxx'
  };

  this.hosts = function (h) {
    _.extend(hosts, h);
  };

  this.$get = ['$http', function () {
    var defaultOpts = {
      m: 'api',
      a: 'do_e_signature_list',
      c_event_id: 118,
      directory: 1
    };

    var stat = {};// service stat such as last_id;
    var server;

    /*
     * Setup default option and clear status
     *
     * @param {String} host alias of host ('CN Test') or host address ('http://xxx.xxx.xxx.xxx')
     * @param {Object} opts new options
     */
    function setup(host, opts) {
      var d3ToLegacy = {
        eventId: 'c_event_id'
      };

      for (var d3Key in d3ToLegacy) {
        var legacyKey = d3ToLegacy[d3Key];
        opts[legacyKey] = opts[d3Key];
        delete opts[d3Key];
      }

      server = hosts[host] || host;
      _.extend(defaultOpts, opts);
      stat = {};
    }

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
      } else if (typeof host === 'function') {
        error = opts;
        success = host;
      }

      if (!opts) {
        opts = {};
      }

      _.defaults(opts, defaultOpts);

      var url = format('%s/?%s', server, query.stringify(opts));

      return $http.get(url)
             .error(error)
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

               data = data.map(function (d) {
                 return {
                   id: d.id,
                   href: format('%s/hphoto/%s', server, d.trans_filename),
                   timestamp: d.signature
                 };
               });
               if (data.length) {
                 stat.lastId = data[data.length - 1].id;
               }
               success(data);
             });
    }

    /* submit signature to backend */
    function add() {
      console.log("signature added to backend");
    }

    /* get update since last query */
    function update(success, error) {
      return list({last_id: stat.lastId}, success, error);
    }

    return {
      setup: setup,
      list: list,
      update: update,
      add: add
    };
  }];
}

exports = module.exports =
  angular.module('letsface/signatureApiLegacy', [])
  .provider('signatureApi', SignatureApiProvider);
