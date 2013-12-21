
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("jashkenas-underscore/underscore.js", Function("exports, require, module",
"//     Underscore.js 1.5.2\n\
//     http://underscorejs.org\n\
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors\n\
//     Underscore may be freely distributed under the MIT license.\n\
\n\
(function() {\n\
\n\
  // Baseline setup\n\
  // --------------\n\
\n\
  // Establish the root object, `window` in the browser, or `exports` on the server.\n\
  var root = this;\n\
\n\
  // Save the previous value of the `_` variable.\n\
  var previousUnderscore = root._;\n\
\n\
  // Establish the object that gets returned to break out of a loop iteration.\n\
  var breaker = {};\n\
\n\
  // Save bytes in the minified (but not gzipped) version:\n\
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;\n\
\n\
  //use the faster Date.now if available.\n\
  var getTime = (Date.now || function() {\n\
    return new Date().getTime();\n\
  });\n\
\n\
  // Create quick reference variables for speed access to core prototypes.\n\
  var\n\
    push             = ArrayProto.push,\n\
    slice            = ArrayProto.slice,\n\
    concat           = ArrayProto.concat,\n\
    toString         = ObjProto.toString,\n\
    hasOwnProperty   = ObjProto.hasOwnProperty;\n\
\n\
  // All **ECMAScript 5** native function implementations that we hope to use\n\
  // are declared here.\n\
  var\n\
    nativeForEach      = ArrayProto.forEach,\n\
    nativeMap          = ArrayProto.map,\n\
    nativeReduce       = ArrayProto.reduce,\n\
    nativeReduceRight  = ArrayProto.reduceRight,\n\
    nativeFilter       = ArrayProto.filter,\n\
    nativeEvery        = ArrayProto.every,\n\
    nativeSome         = ArrayProto.some,\n\
    nativeIndexOf      = ArrayProto.indexOf,\n\
    nativeLastIndexOf  = ArrayProto.lastIndexOf,\n\
    nativeIsArray      = Array.isArray,\n\
    nativeKeys         = Object.keys,\n\
    nativeBind         = FuncProto.bind;\n\
\n\
  // Create a safe reference to the Underscore object for use below.\n\
  var _ = function(obj) {\n\
    if (obj instanceof _) return obj;\n\
    if (!(this instanceof _)) return new _(obj);\n\
    this._wrapped = obj;\n\
  };\n\
\n\
  // Export the Underscore object for **Node.js**, with\n\
  // backwards-compatibility for the old `require()` API. If we're in\n\
  // the browser, add `_` as a global object via a string identifier,\n\
  // for Closure Compiler \"advanced\" mode.\n\
  if (typeof exports !== 'undefined') {\n\
    if (typeof module !== 'undefined' && module.exports) {\n\
      exports = module.exports = _;\n\
    }\n\
    exports._ = _;\n\
  } else {\n\
    root._ = _;\n\
  }\n\
\n\
  // Current version.\n\
  _.VERSION = '1.5.2';\n\
\n\
  // Collection Functions\n\
  // --------------------\n\
\n\
  // The cornerstone, an `each` implementation, aka `forEach`.\n\
  // Handles objects with the built-in `forEach`, arrays, and raw objects.\n\
  // Delegates to **ECMAScript 5**'s native `forEach` if available.\n\
  var each = _.each = _.forEach = function(obj, iterator, context) {\n\
    if (obj == null) return;\n\
    if (nativeForEach && obj.forEach === nativeForEach) {\n\
      obj.forEach(iterator, context);\n\
    } else if (obj.length === +obj.length) {\n\
      for (var i = 0, length = obj.length; i < length; i++) {\n\
        if (iterator.call(context, obj[i], i, obj) === breaker) return;\n\
      }\n\
    } else {\n\
      var keys = _.keys(obj);\n\
      for (var i = 0, length = keys.length; i < length; i++) {\n\
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;\n\
      }\n\
    }\n\
  };\n\
\n\
  // Return the results of applying the iterator to each element.\n\
  // Delegates to **ECMAScript 5**'s native `map` if available.\n\
  _.map = _.collect = function(obj, iterator, context) {\n\
    var results = [];\n\
    if (obj == null) return results;\n\
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);\n\
    each(obj, function(value, index, list) {\n\
      results.push(iterator.call(context, value, index, list));\n\
    });\n\
    return results;\n\
  };\n\
\n\
  var reduceError = 'Reduce of empty array with no initial value';\n\
\n\
  // **Reduce** builds up a single result from a list of values, aka `inject`,\n\
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.\n\
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {\n\
    var initial = arguments.length > 2;\n\
    if (obj == null) obj = [];\n\
    if (nativeReduce && obj.reduce === nativeReduce) {\n\
      if (context) iterator = _.bind(iterator, context);\n\
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);\n\
    }\n\
    each(obj, function(value, index, list) {\n\
      if (!initial) {\n\
        memo = value;\n\
        initial = true;\n\
      } else {\n\
        memo = iterator.call(context, memo, value, index, list);\n\
      }\n\
    });\n\
    if (!initial) throw new TypeError(reduceError);\n\
    return memo;\n\
  };\n\
\n\
  // The right-associative version of reduce, also known as `foldr`.\n\
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.\n\
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {\n\
    var initial = arguments.length > 2;\n\
    if (obj == null) obj = [];\n\
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {\n\
      if (context) iterator = _.bind(iterator, context);\n\
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);\n\
    }\n\
    var length = obj.length;\n\
    if (length !== +length) {\n\
      var keys = _.keys(obj);\n\
      length = keys.length;\n\
    }\n\
    each(obj, function(value, index, list) {\n\
      index = keys ? keys[--length] : --length;\n\
      if (!initial) {\n\
        memo = obj[index];\n\
        initial = true;\n\
      } else {\n\
        memo = iterator.call(context, memo, obj[index], index, list);\n\
      }\n\
    });\n\
    if (!initial) throw new TypeError(reduceError);\n\
    return memo;\n\
  };\n\
\n\
  // Return the first value which passes a truth test. Aliased as `detect`.\n\
  _.find = _.detect = function(obj, iterator, context) {\n\
    var result;\n\
    any(obj, function(value, index, list) {\n\
      if (iterator.call(context, value, index, list)) {\n\
        result = value;\n\
        return true;\n\
      }\n\
    });\n\
    return result;\n\
  };\n\
\n\
  // Return all the elements that pass a truth test.\n\
  // Delegates to **ECMAScript 5**'s native `filter` if available.\n\
  // Aliased as `select`.\n\
  _.filter = _.select = function(obj, iterator, context) {\n\
    var results = [];\n\
    if (obj == null) return results;\n\
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);\n\
    each(obj, function(value, index, list) {\n\
      if (iterator.call(context, value, index, list)) results.push(value);\n\
    });\n\
    return results;\n\
  };\n\
\n\
  // Return all the elements for which a truth test fails.\n\
  _.reject = function(obj, iterator, context) {\n\
    return _.filter(obj, function(value, index, list) {\n\
      return !iterator.call(context, value, index, list);\n\
    }, context);\n\
  };\n\
\n\
  // Determine whether all of the elements match a truth test.\n\
  // Delegates to **ECMAScript 5**'s native `every` if available.\n\
  // Aliased as `all`.\n\
  _.every = _.all = function(obj, iterator, context) {\n\
    iterator || (iterator = _.identity);\n\
    var result = true;\n\
    if (obj == null) return result;\n\
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);\n\
    each(obj, function(value, index, list) {\n\
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;\n\
    });\n\
    return !!result;\n\
  };\n\
\n\
  // Determine if at least one element in the object matches a truth test.\n\
  // Delegates to **ECMAScript 5**'s native `some` if available.\n\
  // Aliased as `any`.\n\
  var any = _.some = _.any = function(obj, iterator, context) {\n\
    iterator || (iterator = _.identity);\n\
    var result = false;\n\
    if (obj == null) return result;\n\
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);\n\
    each(obj, function(value, index, list) {\n\
      if (result || (result = iterator.call(context, value, index, list))) return breaker;\n\
    });\n\
    return !!result;\n\
  };\n\
\n\
  // Determine if the array or object contains a given value (using `===`).\n\
  // Aliased as `include`.\n\
  _.contains = _.include = function(obj, target) {\n\
    if (obj == null) return false;\n\
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;\n\
    return any(obj, function(value) {\n\
      return value === target;\n\
    });\n\
  };\n\
\n\
  // Invoke a method (with arguments) on every item in a collection.\n\
  _.invoke = function(obj, method) {\n\
    var args = slice.call(arguments, 2);\n\
    var isFunc = _.isFunction(method);\n\
    return _.map(obj, function(value) {\n\
      return (isFunc ? method : value[method]).apply(value, args);\n\
    });\n\
  };\n\
\n\
  // Convenience version of a common use case of `map`: fetching a property.\n\
  _.pluck = function(obj, key) {\n\
    return _.map(obj, _.property(key));\n\
  };\n\
\n\
  // Convenience version of a common use case of `filter`: selecting only objects\n\
  // containing specific `key:value` pairs.\n\
  _.where = function(obj, attrs, first) {\n\
    if (_.isEmpty(attrs)) return first ? void 0 : [];\n\
    return _[first ? 'find' : 'filter'](obj, function(value) {\n\
      for (var key in attrs) {\n\
        if (attrs[key] !== value[key]) return false;\n\
      }\n\
      return true;\n\
    });\n\
  };\n\
\n\
  // Convenience version of a common use case of `find`: getting the first object\n\
  // containing specific `key:value` pairs.\n\
  _.findWhere = function(obj, attrs) {\n\
    return _.where(obj, attrs, true);\n\
  };\n\
\n\
  // Return the maximum element or (element-based computation).\n\
  // Can't optimize arrays of integers longer than 65,535 elements.\n\
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)\n\
  _.max = function(obj, iterator, context) {\n\
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {\n\
      return Math.max.apply(Math, obj);\n\
    }\n\
    if (!iterator && _.isEmpty(obj)) return -Infinity;\n\
    var result = {computed : -Infinity, value: -Infinity};\n\
    each(obj, function(value, index, list) {\n\
      var computed = iterator ? iterator.call(context, value, index, list) : value;\n\
      computed > result.computed && (result = {value : value, computed : computed});\n\
    });\n\
    return result.value;\n\
  };\n\
\n\
  // Return the minimum element (or element-based computation).\n\
  _.min = function(obj, iterator, context) {\n\
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {\n\
      return Math.min.apply(Math, obj);\n\
    }\n\
    if (!iterator && _.isEmpty(obj)) return Infinity;\n\
    var result = {computed : Infinity, value: Infinity};\n\
    each(obj, function(value, index, list) {\n\
      var computed = iterator ? iterator.call(context, value, index, list) : value;\n\
      computed < result.computed && (result = {value : value, computed : computed});\n\
    });\n\
    return result.value;\n\
  };\n\
\n\
  // Shuffle an array, using the modern version of the\n\
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).\n\
  _.shuffle = function(obj) {\n\
    var rand;\n\
    var index = 0;\n\
    var shuffled = [];\n\
    each(obj, function(value) {\n\
      rand = _.random(index++);\n\
      shuffled[index - 1] = shuffled[rand];\n\
      shuffled[rand] = value;\n\
    });\n\
    return shuffled;\n\
  };\n\
\n\
  // Sample **n** random values from a collection.\n\
  // If **n** is not specified, returns a single random element.\n\
  // The internal `guard` argument allows it to work with `map`.\n\
  _.sample = function(obj, n, guard) {\n\
    if (n == null || guard) {\n\
      if (obj.length !== +obj.length) obj = _.values(obj);\n\
      return obj[_.random(obj.length - 1)];\n\
    }\n\
    return _.shuffle(obj).slice(0, Math.max(0, n));\n\
  };\n\
\n\
  // An internal function to generate lookup iterators.\n\
  var lookupIterator = function(value) {\n\
    if (value == null) return _.identity;\n\
    if (_.isFunction(value)) return value;\n\
    return _.property(value);\n\
  };\n\
\n\
  // Sort the object's values by a criterion produced by an iterator.\n\
  _.sortBy = function(obj, iterator, context) {\n\
    iterator = lookupIterator(iterator);\n\
    return _.pluck(_.map(obj, function(value, index, list) {\n\
      return {\n\
        value: value,\n\
        index: index,\n\
        criteria: iterator.call(context, value, index, list)\n\
      };\n\
    }).sort(function(left, right) {\n\
      var a = left.criteria;\n\
      var b = right.criteria;\n\
      if (a !== b) {\n\
        if (a > b || a === void 0) return 1;\n\
        if (a < b || b === void 0) return -1;\n\
      }\n\
      return left.index - right.index;\n\
    }), 'value');\n\
  };\n\
\n\
  // An internal function used for aggregate \"group by\" operations.\n\
  var group = function(behavior) {\n\
    return function(obj, iterator, context) {\n\
      var result = {};\n\
      iterator = lookupIterator(iterator);\n\
      each(obj, function(value, index) {\n\
        var key = iterator.call(context, value, index, obj);\n\
        behavior(result, key, value);\n\
      });\n\
      return result;\n\
    };\n\
  };\n\
\n\
  // Groups the object's values by a criterion. Pass either a string attribute\n\
  // to group by, or a function that returns the criterion.\n\
  _.groupBy = group(function(result, key, value) {\n\
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);\n\
  });\n\
\n\
  // Indexes the object's values by a criterion, similar to `groupBy`, but for\n\
  // when you know that your index values will be unique.\n\
  _.indexBy = group(function(result, key, value) {\n\
    result[key] = value;\n\
  });\n\
\n\
  // Counts instances of an object that group by a certain criterion. Pass\n\
  // either a string attribute to count by, or a function that returns the\n\
  // criterion.\n\
  _.countBy = group(function(result, key) {\n\
    _.has(result, key) ? result[key]++ : result[key] = 1;\n\
  });\n\
\n\
  // Use a comparator function to figure out the smallest index at which\n\
  // an object should be inserted so as to maintain order. Uses binary search.\n\
  _.sortedIndex = function(array, obj, iterator, context) {\n\
    iterator = lookupIterator(iterator);\n\
    var value = iterator.call(context, obj);\n\
    var low = 0, high = array.length;\n\
    while (low < high) {\n\
      var mid = (low + high) >>> 1;\n\
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;\n\
    }\n\
    return low;\n\
  };\n\
\n\
  // Safely create a real, live array from anything iterable.\n\
  _.toArray = function(obj) {\n\
    if (!obj) return [];\n\
    if (_.isArray(obj)) return slice.call(obj);\n\
    if (obj.length === +obj.length) return _.map(obj, _.identity);\n\
    return _.values(obj);\n\
  };\n\
\n\
  // Return the number of elements in an object.\n\
  _.size = function(obj) {\n\
    if (obj == null) return 0;\n\
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;\n\
  };\n\
\n\
  // Array Functions\n\
  // ---------------\n\
\n\
  // Get the first element of an array. Passing **n** will return the first N\n\
  // values in the array. Aliased as `head` and `take`. The **guard** check\n\
  // allows it to work with `_.map`.\n\
  _.first = _.head = _.take = function(array, n, guard) {\n\
    if (array == null) return void 0;\n\
    if ((n == null) || guard) return array[0];\n\
    if (n < 0) return [];\n\
    return slice.call(array, 0, n);\n\
  };\n\
\n\
  // Returns everything but the last entry of the array. Especially useful on\n\
  // the arguments object. Passing **n** will return all the values in\n\
  // the array, excluding the last N. The **guard** check allows it to work with\n\
  // `_.map`.\n\
  _.initial = function(array, n, guard) {\n\
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));\n\
  };\n\
\n\
  // Get the last element of an array. Passing **n** will return the last N\n\
  // values in the array. The **guard** check allows it to work with `_.map`.\n\
  _.last = function(array, n, guard) {\n\
    if (array == null) return void 0;\n\
    if ((n == null) || guard) return array[array.length - 1];\n\
    return slice.call(array, Math.max(array.length - n, 0));\n\
  };\n\
\n\
  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.\n\
  // Especially useful on the arguments object. Passing an **n** will return\n\
  // the rest N values in the array. The **guard**\n\
  // check allows it to work with `_.map`.\n\
  _.rest = _.tail = _.drop = function(array, n, guard) {\n\
    return slice.call(array, (n == null) || guard ? 1 : n);\n\
  };\n\
\n\
  // Trim out all falsy values from an array.\n\
  _.compact = function(array) {\n\
    return _.filter(array, _.identity);\n\
  };\n\
\n\
  // Internal implementation of a recursive `flatten` function.\n\
  var flatten = function(input, shallow, output) {\n\
    if (shallow && _.every(input, _.isArray)) {\n\
      return concat.apply(output, input);\n\
    }\n\
    each(input, function(value) {\n\
      if (_.isArray(value) || _.isArguments(value)) {\n\
        shallow ? push.apply(output, value) : flatten(value, shallow, output);\n\
      } else {\n\
        output.push(value);\n\
      }\n\
    });\n\
    return output;\n\
  };\n\
\n\
  // Flatten out an array, either recursively (by default), or just one level.\n\
  _.flatten = function(array, shallow) {\n\
    return flatten(array, shallow, []);\n\
  };\n\
\n\
  // Return a version of the array that does not contain the specified value(s).\n\
  _.without = function(array) {\n\
    return _.difference(array, slice.call(arguments, 1));\n\
  };\n\
\n\
  // Produce a duplicate-free version of the array. If the array has already\n\
  // been sorted, you have the option of using a faster algorithm.\n\
  // Aliased as `unique`.\n\
  _.uniq = _.unique = function(array, isSorted, iterator, context) {\n\
    if (_.isFunction(isSorted)) {\n\
      context = iterator;\n\
      iterator = isSorted;\n\
      isSorted = false;\n\
    }\n\
    var initial = iterator ? _.map(array, iterator, context) : array;\n\
    var results = [];\n\
    var seen = [];\n\
    each(initial, function(value, index) {\n\
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {\n\
        seen.push(value);\n\
        results.push(array[index]);\n\
      }\n\
    });\n\
    return results;\n\
  };\n\
\n\
  // Produce an array that contains the union: each distinct element from all of\n\
  // the passed-in arrays.\n\
  _.union = function() {\n\
    return _.uniq(_.flatten(arguments, true));\n\
  };\n\
\n\
  // Produce an array that contains every item shared between all the\n\
  // passed-in arrays.\n\
  _.intersection = function(array) {\n\
    var rest = slice.call(arguments, 1);\n\
    return _.filter(_.uniq(array), function(item) {\n\
      return _.every(rest, function(other) {\n\
        return _.indexOf(other, item) >= 0;\n\
      });\n\
    });\n\
  };\n\
\n\
  // Take the difference between one array and a number of other arrays.\n\
  // Only the elements present in just the first array will remain.\n\
  _.difference = function(array) {\n\
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));\n\
    return _.filter(array, function(value){ return !_.contains(rest, value); });\n\
  };\n\
\n\
  // Zip together multiple lists into a single array -- elements that share\n\
  // an index go together.\n\
  _.zip = function() {\n\
    var length = _.max(_.pluck(arguments, \"length\").concat(0));\n\
    var results = new Array(length);\n\
    for (var i = 0; i < length; i++) {\n\
      results[i] = _.pluck(arguments, '' + i);\n\
    }\n\
    return results;\n\
  };\n\
\n\
  // Converts lists into objects. Pass either a single array of `[key, value]`\n\
  // pairs, or two parallel arrays of the same length -- one of keys, and one of\n\
  // the corresponding values.\n\
  _.object = function(list, values) {\n\
    if (list == null) return {};\n\
    var result = {};\n\
    for (var i = 0, length = list.length; i < length; i++) {\n\
      if (values) {\n\
        result[list[i]] = values[i];\n\
      } else {\n\
        result[list[i][0]] = list[i][1];\n\
      }\n\
    }\n\
    return result;\n\
  };\n\
\n\
  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),\n\
  // we need this function. Return the position of the first occurrence of an\n\
  // item in an array, or -1 if the item is not included in the array.\n\
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.\n\
  // If the array is large and already in sort order, pass `true`\n\
  // for **isSorted** to use binary search.\n\
  _.indexOf = function(array, item, isSorted) {\n\
    if (array == null) return -1;\n\
    var i = 0, length = array.length;\n\
    if (isSorted) {\n\
      if (typeof isSorted == 'number') {\n\
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);\n\
      } else {\n\
        i = _.sortedIndex(array, item);\n\
        return array[i] === item ? i : -1;\n\
      }\n\
    }\n\
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);\n\
    for (; i < length; i++) if (array[i] === item) return i;\n\
    return -1;\n\
  };\n\
\n\
  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.\n\
  _.lastIndexOf = function(array, item, from) {\n\
    if (array == null) return -1;\n\
    var hasIndex = from != null;\n\
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {\n\
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);\n\
    }\n\
    var i = (hasIndex ? from : array.length);\n\
    while (i--) if (array[i] === item) return i;\n\
    return -1;\n\
  };\n\
\n\
  // Generate an integer Array containing an arithmetic progression. A port of\n\
  // the native Python `range()` function. See\n\
  // [the Python documentation](http://docs.python.org/library/functions.html#range).\n\
  _.range = function(start, stop, step) {\n\
    if (arguments.length <= 1) {\n\
      stop = start || 0;\n\
      start = 0;\n\
    }\n\
    step = arguments[2] || 1;\n\
\n\
    var length = Math.max(Math.ceil((stop - start) / step), 0);\n\
    var idx = 0;\n\
    var range = new Array(length);\n\
\n\
    while(idx < length) {\n\
      range[idx++] = start;\n\
      start += step;\n\
    }\n\
\n\
    return range;\n\
  };\n\
\n\
  // Function (ahem) Functions\n\
  // ------------------\n\
\n\
  // Reusable constructor function for prototype setting.\n\
  var ctor = function(){};\n\
\n\
  // Create a function bound to a given object (assigning `this`, and arguments,\n\
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if\n\
  // available.\n\
  _.bind = function(func, context) {\n\
    var args, bound;\n\
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));\n\
    if (!_.isFunction(func)) throw new TypeError;\n\
    args = slice.call(arguments, 2);\n\
    return bound = function() {\n\
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));\n\
      ctor.prototype = func.prototype;\n\
      var self = new ctor;\n\
      ctor.prototype = null;\n\
      var result = func.apply(self, args.concat(slice.call(arguments)));\n\
      if (Object(result) === result) return result;\n\
      return self;\n\
    };\n\
  };\n\
\n\
  // Partially apply a function by creating a version that has had some of its\n\
  // arguments pre-filled, without changing its dynamic `this` context.\n\
  _.partial = function(func) {\n\
    var args = slice.call(arguments, 1);\n\
    return function() {\n\
      return func.apply(this, args.concat(slice.call(arguments)));\n\
    };\n\
  };\n\
\n\
  // Bind a number of an object's methods to that object. Remaining arguments\n\
  // are the method names to be bound. Useful for ensuring that all callbacks\n\
  // defined on an object belong to it.\n\
  _.bindAll = function(obj) {\n\
    var funcs = slice.call(arguments, 1);\n\
    if (funcs.length === 0) throw new Error(\"bindAll must be passed function names\");\n\
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });\n\
    return obj;\n\
  };\n\
\n\
  // Memoize an expensive function by storing its results.\n\
  _.memoize = function(func, hasher) {\n\
    var memo = {};\n\
    hasher || (hasher = _.identity);\n\
    return function() {\n\
      var key = hasher.apply(this, arguments);\n\
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));\n\
    };\n\
  };\n\
\n\
  // Delays a function for the given number of milliseconds, and then calls\n\
  // it with the arguments supplied.\n\
  _.delay = function(func, wait) {\n\
    var args = slice.call(arguments, 2);\n\
    return setTimeout(function(){ return func.apply(null, args); }, wait);\n\
  };\n\
\n\
  // Defers a function, scheduling it to run after the current call stack has\n\
  // cleared.\n\
  _.defer = function(func) {\n\
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));\n\
  };\n\
\n\
  // Returns a function, that, when invoked, will only be triggered at most once\n\
  // during a given window of time. Normally, the throttled function will run\n\
  // as much as it can, without ever going more than once per `wait` duration;\n\
  // but if you'd like to disable the execution on the leading edge, pass\n\
  // `{leading: false}`. To disable execution on the trailing edge, ditto.\n\
  _.throttle = function(func, wait, options) {\n\
    var context, args, result;\n\
    var timeout = null;\n\
    var previous = 0;\n\
    options || (options = {});\n\
    var later = function() {\n\
      previous = options.leading === false ? 0 : getTime();\n\
      timeout = null;\n\
      result = func.apply(context, args);\n\
      context = args = null;\n\
    };\n\
    return function() {\n\
      var now = getTime();\n\
      if (!previous && options.leading === false) previous = now;\n\
      var remaining = wait - (now - previous);\n\
      context = this;\n\
      args = arguments;\n\
      if (remaining <= 0) {\n\
        clearTimeout(timeout);\n\
        timeout = null;\n\
        previous = now;\n\
        result = func.apply(context, args);\n\
        context = args = null;\n\
      } else if (!timeout && options.trailing !== false) {\n\
        timeout = setTimeout(later, remaining);\n\
      }\n\
      return result;\n\
    };\n\
  };\n\
\n\
  // Returns a function, that, as long as it continues to be invoked, will not\n\
  // be triggered. The function will be called after it stops being called for\n\
  // N milliseconds. If `immediate` is passed, trigger the function on the\n\
  // leading edge, instead of the trailing.\n\
  _.debounce = function(func, wait, immediate) {\n\
    var timeout, args, context, timestamp, result;\n\
    return function() {\n\
      context = this;\n\
      args = arguments;\n\
      timestamp = getTime();\n\
      var later = function() {\n\
        var last = getTime() - timestamp;\n\
        if (last < wait) {\n\
          timeout = setTimeout(later, wait - last);\n\
        } else {\n\
          timeout = null;\n\
          if (!immediate) {\n\
            result = func.apply(context, args);\n\
            context = args = null;\n\
          }\n\
        }\n\
      };\n\
      var callNow = immediate && !timeout;\n\
      if (!timeout) {\n\
        timeout = setTimeout(later, wait);\n\
      }\n\
      if (callNow) {\n\
        result = func.apply(context, args);\n\
        context = args = null;\n\
      }\n\
\n\
      return result;\n\
    };\n\
  };\n\
\n\
  // Returns a function that will be executed at most one time, no matter how\n\
  // often you call it. Useful for lazy initialization.\n\
  _.once = function(func) {\n\
    var ran = false, memo;\n\
    return function() {\n\
      if (ran) return memo;\n\
      ran = true;\n\
      memo = func.apply(this, arguments);\n\
      func = null;\n\
      return memo;\n\
    };\n\
  };\n\
\n\
  // Returns the first function passed as an argument to the second,\n\
  // allowing you to adjust arguments, run code before and after, and\n\
  // conditionally execute the original function.\n\
  _.wrap = function(func, wrapper) {\n\
    return _.partial(wrapper, func);\n\
  };\n\
\n\
  // Returns a function that is the composition of a list of functions, each\n\
  // consuming the return value of the function that follows.\n\
  _.compose = function() {\n\
    var funcs = arguments;\n\
    return function() {\n\
      var args = arguments;\n\
      for (var i = funcs.length - 1; i >= 0; i--) {\n\
        args = [funcs[i].apply(this, args)];\n\
      }\n\
      return args[0];\n\
    };\n\
  };\n\
\n\
  // Returns a function that will only be executed after being called N times.\n\
  _.after = function(times, func) {\n\
    return function() {\n\
      if (--times < 1) {\n\
        return func.apply(this, arguments);\n\
      }\n\
    };\n\
  };\n\
\n\
  // Object Functions\n\
  // ----------------\n\
\n\
  // Retrieve the names of an object's properties.\n\
  // Delegates to **ECMAScript 5**'s native `Object.keys`\n\
  _.keys = nativeKeys || function(obj) {\n\
    if (obj !== Object(obj)) throw new TypeError('Invalid object');\n\
    var keys = [];\n\
    for (var key in obj) if (_.has(obj, key)) keys.push(key);\n\
    return keys;\n\
  };\n\
\n\
  // Retrieve the values of an object's properties.\n\
  _.values = function(obj) {\n\
    var keys = _.keys(obj);\n\
    var length = keys.length;\n\
    var values = new Array(length);\n\
    for (var i = 0; i < length; i++) {\n\
      values[i] = obj[keys[i]];\n\
    }\n\
    return values;\n\
  };\n\
\n\
  // Convert an object into a list of `[key, value]` pairs.\n\
  _.pairs = function(obj) {\n\
    var keys = _.keys(obj);\n\
    var length = keys.length;\n\
    var pairs = new Array(length);\n\
    for (var i = 0; i < length; i++) {\n\
      pairs[i] = [keys[i], obj[keys[i]]];\n\
    }\n\
    return pairs;\n\
  };\n\
\n\
  // Invert the keys and values of an object. The values must be serializable.\n\
  _.invert = function(obj) {\n\
    var result = {};\n\
    var keys = _.keys(obj);\n\
    for (var i = 0, length = keys.length; i < length; i++) {\n\
      result[obj[keys[i]]] = keys[i];\n\
    }\n\
    return result;\n\
  };\n\
\n\
  // Return a sorted list of the function names available on the object.\n\
  // Aliased as `methods`\n\
  _.functions = _.methods = function(obj) {\n\
    var names = [];\n\
    for (var key in obj) {\n\
      if (_.isFunction(obj[key])) names.push(key);\n\
    }\n\
    return names.sort();\n\
  };\n\
\n\
  // Extend a given object with all the properties in passed-in object(s).\n\
  _.extend = function(obj) {\n\
    each(slice.call(arguments, 1), function(source) {\n\
      if (source) {\n\
        for (var prop in source) {\n\
          obj[prop] = source[prop];\n\
        }\n\
      }\n\
    });\n\
    return obj;\n\
  };\n\
\n\
  // Return a copy of the object only containing the whitelisted properties.\n\
  _.pick = function(obj) {\n\
    var copy = {};\n\
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));\n\
    each(keys, function(key) {\n\
      if (key in obj) copy[key] = obj[key];\n\
    });\n\
    return copy;\n\
  };\n\
\n\
   // Return a copy of the object without the blacklisted properties.\n\
  _.omit = function(obj) {\n\
    var copy = {};\n\
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));\n\
    for (var key in obj) {\n\
      if (!_.contains(keys, key)) copy[key] = obj[key];\n\
    }\n\
    return copy;\n\
  };\n\
\n\
  // Fill in a given object with default properties.\n\
  _.defaults = function(obj) {\n\
    each(slice.call(arguments, 1), function(source) {\n\
      if (source) {\n\
        for (var prop in source) {\n\
          if (obj[prop] === void 0) obj[prop] = source[prop];\n\
        }\n\
      }\n\
    });\n\
    return obj;\n\
  };\n\
\n\
  // Create a (shallow-cloned) duplicate of an object.\n\
  _.clone = function(obj) {\n\
    if (!_.isObject(obj)) return obj;\n\
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);\n\
  };\n\
\n\
  // Invokes interceptor with the obj, and then returns obj.\n\
  // The primary purpose of this method is to \"tap into\" a method chain, in\n\
  // order to perform operations on intermediate results within the chain.\n\
  _.tap = function(obj, interceptor) {\n\
    interceptor(obj);\n\
    return obj;\n\
  };\n\
\n\
  // Internal recursive comparison function for `isEqual`.\n\
  var eq = function(a, b, aStack, bStack) {\n\
    // Identical objects are equal. `0 === -0`, but they aren't identical.\n\
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).\n\
    if (a === b) return a !== 0 || 1 / a == 1 / b;\n\
    // A strict comparison is necessary because `null == undefined`.\n\
    if (a == null || b == null) return a === b;\n\
    // Unwrap any wrapped objects.\n\
    if (a instanceof _) a = a._wrapped;\n\
    if (b instanceof _) b = b._wrapped;\n\
    // Compare `[[Class]]` names.\n\
    var className = toString.call(a);\n\
    if (className != toString.call(b)) return false;\n\
    switch (className) {\n\
      // Strings, numbers, dates, and booleans are compared by value.\n\
      case '[object String]':\n\
        // Primitives and their corresponding object wrappers are equivalent; thus, `\"5\"` is\n\
        // equivalent to `new String(\"5\")`.\n\
        return a == String(b);\n\
      case '[object Number]':\n\
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for\n\
        // other numeric values.\n\
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);\n\
      case '[object Date]':\n\
      case '[object Boolean]':\n\
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their\n\
        // millisecond representations. Note that invalid dates with millisecond representations\n\
        // of `NaN` are not equivalent.\n\
        return +a == +b;\n\
      // RegExps are compared by their source patterns and flags.\n\
      case '[object RegExp]':\n\
        return a.source == b.source &&\n\
               a.global == b.global &&\n\
               a.multiline == b.multiline &&\n\
               a.ignoreCase == b.ignoreCase;\n\
    }\n\
    if (typeof a != 'object' || typeof b != 'object') return false;\n\
    // Assume equality for cyclic structures. The algorithm for detecting cyclic\n\
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.\n\
    var length = aStack.length;\n\
    while (length--) {\n\
      // Linear search. Performance is inversely proportional to the number of\n\
      // unique nested structures.\n\
      if (aStack[length] == a) return bStack[length] == b;\n\
    }\n\
    // Objects with different constructors are not equivalent, but `Object`s\n\
    // from different frames are.\n\
    var aCtor = a.constructor, bCtor = b.constructor;\n\
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&\n\
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))\n\
                        && ('constructor' in a && 'constructor' in b)) {\n\
      return false;\n\
    }\n\
    // Add the first object to the stack of traversed objects.\n\
    aStack.push(a);\n\
    bStack.push(b);\n\
    var size = 0, result = true;\n\
    // Recursively compare objects and arrays.\n\
    if (className == '[object Array]') {\n\
      // Compare array lengths to determine if a deep comparison is necessary.\n\
      size = a.length;\n\
      result = size == b.length;\n\
      if (result) {\n\
        // Deep compare the contents, ignoring non-numeric properties.\n\
        while (size--) {\n\
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;\n\
        }\n\
      }\n\
    } else {\n\
      // Deep compare objects.\n\
      for (var key in a) {\n\
        if (_.has(a, key)) {\n\
          // Count the expected number of properties.\n\
          size++;\n\
          // Deep compare each member.\n\
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;\n\
        }\n\
      }\n\
      // Ensure that both objects contain the same number of properties.\n\
      if (result) {\n\
        for (key in b) {\n\
          if (_.has(b, key) && !(size--)) break;\n\
        }\n\
        result = !size;\n\
      }\n\
    }\n\
    // Remove the first object from the stack of traversed objects.\n\
    aStack.pop();\n\
    bStack.pop();\n\
    return result;\n\
  };\n\
\n\
  // Perform a deep comparison to check if two objects are equal.\n\
  _.isEqual = function(a, b) {\n\
    return eq(a, b, [], []);\n\
  };\n\
\n\
  // Is a given array, string, or object empty?\n\
  // An \"empty\" object has no enumerable own-properties.\n\
  _.isEmpty = function(obj) {\n\
    if (obj == null) return true;\n\
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;\n\
    for (var key in obj) if (_.has(obj, key)) return false;\n\
    return true;\n\
  };\n\
\n\
  // Is a given value a DOM element?\n\
  _.isElement = function(obj) {\n\
    return !!(obj && obj.nodeType === 1);\n\
  };\n\
\n\
  // Is a given value an array?\n\
  // Delegates to ECMA5's native Array.isArray\n\
  _.isArray = nativeIsArray || function(obj) {\n\
    return toString.call(obj) == '[object Array]';\n\
  };\n\
\n\
  // Is a given variable an object?\n\
  _.isObject = function(obj) {\n\
    return obj === Object(obj);\n\
  };\n\
\n\
  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.\n\
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {\n\
    _['is' + name] = function(obj) {\n\
      return toString.call(obj) == '[object ' + name + ']';\n\
    };\n\
  });\n\
\n\
  // Define a fallback version of the method in browsers (ahem, IE), where\n\
  // there isn't any inspectable \"Arguments\" type.\n\
  if (!_.isArguments(arguments)) {\n\
    _.isArguments = function(obj) {\n\
      return !!(obj && _.has(obj, 'callee'));\n\
    };\n\
  }\n\
\n\
  // Optimize `isFunction` if appropriate.\n\
  if (typeof (/./) !== 'function') {\n\
    _.isFunction = function(obj) {\n\
      return typeof obj === 'function';\n\
    };\n\
  }\n\
\n\
  // Is a given object a finite number?\n\
  _.isFinite = function(obj) {\n\
    return isFinite(obj) && !isNaN(parseFloat(obj));\n\
  };\n\
\n\
  // Is the given value `NaN`? (NaN is the only number which does not equal itself).\n\
  _.isNaN = function(obj) {\n\
    return _.isNumber(obj) && obj != +obj;\n\
  };\n\
\n\
  // Is a given value a boolean?\n\
  _.isBoolean = function(obj) {\n\
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';\n\
  };\n\
\n\
  // Is a given value equal to null?\n\
  _.isNull = function(obj) {\n\
    return obj === null;\n\
  };\n\
\n\
  // Is a given variable undefined?\n\
  _.isUndefined = function(obj) {\n\
    return obj === void 0;\n\
  };\n\
\n\
  // Shortcut function for checking if an object has a given property directly\n\
  // on itself (in other words, not on a prototype).\n\
  _.has = function(obj, key) {\n\
    return hasOwnProperty.call(obj, key);\n\
  };\n\
\n\
  // Utility Functions\n\
  // -----------------\n\
\n\
  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its\n\
  // previous owner. Returns a reference to the Underscore object.\n\
  _.noConflict = function() {\n\
    root._ = previousUnderscore;\n\
    return this;\n\
  };\n\
\n\
  // Keep the identity function around for default iterators.\n\
  _.identity = function(value) {\n\
    return value;\n\
  };\n\
\n\
  _.constant = function(value) {\n\
    return function () {\n\
      return value;\n\
    };\n\
  };\n\
\n\
  _.property = function(key) {\n\
    return function(obj) {\n\
      return obj[key];\n\
    };\n\
  };\n\
\n\
  // Run a function **n** times.\n\
  _.times = function(n, iterator, context) {\n\
    var accum = Array(Math.max(0, n));\n\
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);\n\
    return accum;\n\
  };\n\
\n\
  // Return a random integer between min and max (inclusive).\n\
  _.random = function(min, max) {\n\
    if (max == null) {\n\
      max = min;\n\
      min = 0;\n\
    }\n\
    return min + Math.floor(Math.random() * (max - min + 1));\n\
  };\n\
\n\
  // List of HTML entities for escaping.\n\
  var entityMap = {\n\
    escape: {\n\
      '&': '&amp;',\n\
      '<': '&lt;',\n\
      '>': '&gt;',\n\
      '\"': '&quot;',\n\
      \"'\": '&#x27;'\n\
    }\n\
  };\n\
  entityMap.unescape = _.invert(entityMap.escape);\n\
\n\
  // Regexes containing the keys and values listed immediately above.\n\
  var entityRegexes = {\n\
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),\n\
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')\n\
  };\n\
\n\
  // Functions for escaping and unescaping strings to/from HTML interpolation.\n\
  _.each(['escape', 'unescape'], function(method) {\n\
    _[method] = function(string) {\n\
      if (string == null) return '';\n\
      return ('' + string).replace(entityRegexes[method], function(match) {\n\
        return entityMap[method][match];\n\
      });\n\
    };\n\
  });\n\
\n\
  // If the value of the named `property` is a function then invoke it with the\n\
  // `object` as context; otherwise, return it.\n\
  _.result = function(object, property) {\n\
    if (object == null) return void 0;\n\
    var value = object[property];\n\
    return _.isFunction(value) ? value.call(object) : value;\n\
  };\n\
\n\
  // Add your own custom functions to the Underscore object.\n\
  _.mixin = function(obj) {\n\
    each(_.functions(obj), function(name) {\n\
      var func = _[name] = obj[name];\n\
      _.prototype[name] = function() {\n\
        var args = [this._wrapped];\n\
        push.apply(args, arguments);\n\
        return result.call(this, func.apply(_, args));\n\
      };\n\
    });\n\
  };\n\
\n\
  // Generate a unique integer id (unique within the entire client session).\n\
  // Useful for temporary DOM ids.\n\
  var idCounter = 0;\n\
  _.uniqueId = function(prefix) {\n\
    var id = ++idCounter + '';\n\
    return prefix ? prefix + id : id;\n\
  };\n\
\n\
  // By default, Underscore uses ERB-style template delimiters, change the\n\
  // following template settings to use alternative delimiters.\n\
  _.templateSettings = {\n\
    evaluate    : /<%([\\s\\S]+?)%>/g,\n\
    interpolate : /<%=([\\s\\S]+?)%>/g,\n\
    escape      : /<%-([\\s\\S]+?)%>/g\n\
  };\n\
\n\
  // When customizing `templateSettings`, if you don't want to define an\n\
  // interpolation, evaluation or escaping regex, we need one that is\n\
  // guaranteed not to match.\n\
  var noMatch = /(.)^/;\n\
\n\
  // Certain characters need to be escaped so that they can be put into a\n\
  // string literal.\n\
  var escapes = {\n\
    \"'\":      \"'\",\n\
    '\\\\':     '\\\\',\n\
    '\\r':     'r',\n\
    '\\n\
':     'n',\n\
    '\\t':     't',\n\
    '\\u2028': 'u2028',\n\
    '\\u2029': 'u2029'\n\
  };\n\
\n\
  var escaper = /\\\\|'|\\r|\\n\
|\\t|\\u2028|\\u2029/g;\n\
\n\
  // JavaScript micro-templating, similar to John Resig's implementation.\n\
  // Underscore templating handles arbitrary delimiters, preserves whitespace,\n\
  // and correctly escapes quotes within interpolated code.\n\
  _.template = function(text, data, settings) {\n\
    var render;\n\
    settings = _.defaults({}, settings, _.templateSettings);\n\
\n\
    // Combine delimiters into one regular expression via alternation.\n\
    var matcher = new RegExp([\n\
      (settings.escape || noMatch).source,\n\
      (settings.interpolate || noMatch).source,\n\
      (settings.evaluate || noMatch).source\n\
    ].join('|') + '|$', 'g');\n\
\n\
    // Compile the template source, escaping string literals appropriately.\n\
    var index = 0;\n\
    var source = \"__p+='\";\n\
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {\n\
      source += text.slice(index, offset)\n\
        .replace(escaper, function(match) { return '\\\\' + escapes[match]; });\n\
\n\
      if (escape) {\n\
        source += \"'+\\n\
((__t=(\" + escape + \"))==null?'':_.escape(__t))+\\n\
'\";\n\
      }\n\
      if (interpolate) {\n\
        source += \"'+\\n\
((__t=(\" + interpolate + \"))==null?'':__t)+\\n\
'\";\n\
      }\n\
      if (evaluate) {\n\
        source += \"';\\n\
\" + evaluate + \"\\n\
__p+='\";\n\
      }\n\
      index = offset + match.length;\n\
      return match;\n\
    });\n\
    source += \"';\\n\
\";\n\
\n\
    // If a variable is not specified, place data values in local scope.\n\
    if (!settings.variable) source = 'with(obj||{}){\\n\
' + source + '}\\n\
';\n\
\n\
    source = \"var __t,__p='',__j=Array.prototype.join,\" +\n\
      \"print=function(){__p+=__j.call(arguments,'');};\\n\
\" +\n\
      source + \"return __p;\\n\
\";\n\
\n\
    try {\n\
      render = new Function(settings.variable || 'obj', '_', source);\n\
    } catch (e) {\n\
      e.source = source;\n\
      throw e;\n\
    }\n\
\n\
    if (data) return render(data, _);\n\
    var template = function(data) {\n\
      return render.call(this, data, _);\n\
    };\n\
\n\
    // Provide the compiled function source as a convenience for precompilation.\n\
    template.source = 'function(' + (settings.variable || 'obj') + '){\\n\
' + source + '}';\n\
\n\
    return template;\n\
  };\n\
\n\
  // Add a \"chain\" function, which will delegate to the wrapper.\n\
  _.chain = function(obj) {\n\
    return _(obj).chain();\n\
  };\n\
\n\
  // OOP\n\
  // ---------------\n\
  // If Underscore is called as a function, it returns a wrapped object that\n\
  // can be used OO-style. This wrapper holds altered versions of all the\n\
  // underscore functions. Wrapped objects may be chained.\n\
\n\
  // Helper function to continue chaining intermediate results.\n\
  var result = function(obj) {\n\
    return this._chain ? _(obj).chain() : obj;\n\
  };\n\
\n\
  // Add all of the Underscore functions to the wrapper object.\n\
  _.mixin(_);\n\
\n\
  // Add all mutator Array functions to the wrapper.\n\
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {\n\
    var method = ArrayProto[name];\n\
    _.prototype[name] = function() {\n\
      var obj = this._wrapped;\n\
      method.apply(obj, arguments);\n\
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];\n\
      return result.call(this, obj);\n\
    };\n\
  });\n\
\n\
  // Add all accessor Array functions to the wrapper.\n\
  each(['concat', 'join', 'slice'], function(name) {\n\
    var method = ArrayProto[name];\n\
    _.prototype[name] = function() {\n\
      return result.call(this, method.apply(this._wrapped, arguments));\n\
    };\n\
  });\n\
\n\
  _.extend(_.prototype, {\n\
\n\
    // Start chaining a wrapped Underscore object.\n\
    chain: function() {\n\
      this._chain = true;\n\
      return this;\n\
    },\n\
\n\
    // Extracts the result from a wrapped and chained object.\n\
    value: function() {\n\
      return this._wrapped;\n\
    }\n\
\n\
  });\n\
\n\
  // AMD registration happens at the end for compatibility with AMD loaders\n\
  // that may not enforce next-turn semantics on modules. Even though general\n\
  // practice for AMD registration is to be anonymous, underscore registers\n\
  // as a named module because, like jQuery, it is a base library that is\n\
  // popular enough to be bundled in a third party lib, but not be part of\n\
  // an AMD load request. Those cases could generate an error when an\n\
  // anonymous define() is called outside of a loader request.\n\
  if (typeof define === 'function' && define.amd) {\n\
    define('underscore', [], function() {\n\
      return _;\n\
    });\n\
  }\n\
}).call(this);\n\
//@ sourceURL=jashkenas-underscore/underscore.js"
));
require.register("component-trim/index.js", Function("exports, require, module",
"\n\
exports = module.exports = trim;\n\
\n\
function trim(str){\n\
  if (str.trim) return str.trim();\n\
  return str.replace(/^\\s*|\\s*$/g, '');\n\
}\n\
\n\
exports.left = function(str){\n\
  if (str.trimLeft) return str.trimLeft();\n\
  return str.replace(/^\\s*/, '');\n\
};\n\
\n\
exports.right = function(str){\n\
  if (str.trimRight) return str.trimRight();\n\
  return str.replace(/\\s*$/, '');\n\
};\n\
//@ sourceURL=component-trim/index.js"
));
require.register("component-querystring/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var trim = require('trim');\n\
\n\
/**\n\
 * Parse the given query `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api public\n\
 */\n\
\n\
exports.parse = function(str){\n\
  if ('string' != typeof str) return {};\n\
\n\
  str = trim(str);\n\
  if ('' == str) return {};\n\
  if ('?' == str.charAt(0)) str = str.slice(1);\n\
\n\
  var obj = {};\n\
  var pairs = str.split('&');\n\
  for (var i = 0; i < pairs.length; i++) {\n\
    var parts = pairs[i].split('=');\n\
    obj[parts[0]] = null == parts[1]\n\
      ? ''\n\
      : decodeURIComponent(parts[1]);\n\
  }\n\
\n\
  return obj;\n\
};\n\
\n\
/**\n\
 * Stringify the given `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
exports.stringify = function(obj){\n\
  if (!obj) return '';\n\
  var pairs = [];\n\
  for (var key in obj) {\n\
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));\n\
  }\n\
  return pairs.join('&');\n\
};\n\
//@ sourceURL=component-querystring/index.js"
));
require.register("samsonjs-format/format.js", Function("exports, require, module",
"//\n\
// format - printf-like string formatting for JavaScript\n\
// github.com/samsonjs/format\n\
// @_sjs\n\
//\n\
// Copyright 2010 - 2013 Sami Samhuri <sami@samhuri.net>\n\
//\n\
// MIT License\n\
// http://sjs.mit-license.org\n\
//\n\
\n\
;(function() {\n\
\n\
  //// Export the API\n\
  var namespace;\n\
\n\
  // CommonJS / Node module\n\
  if (typeof module !== 'undefined') {\n\
    namespace = module.exports = format;\n\
  }\n\
\n\
  // Browsers and other environments\n\
  else {\n\
    // Get the global object. Works in ES3, ES5, and ES5 strict mode.\n\
    namespace = (function(){ return this || (1,eval)('this') }());\n\
  }\n\
\n\
  namespace.format = format;\n\
  namespace.vsprintf = vsprintf;\n\
\n\
  if (typeof console !== 'undefined' && typeof console.log === 'function') {\n\
    namespace.printf = printf;\n\
  }\n\
\n\
  function printf(/* ... */) {\n\
    console.log(format.apply(null, arguments));\n\
  }\n\
\n\
  function vsprintf(fmt, replacements) {\n\
    return format.apply(null, [fmt].concat(replacements));\n\
  }\n\
\n\
  function format(fmt) {\n\
    var argIndex = 1 // skip initial format argument\n\
      , args = [].slice.call(arguments)\n\
      , i = 0\n\
      , n = fmt.length\n\
      , result = ''\n\
      , c\n\
      , escaped = false\n\
      , arg\n\
      , precision\n\
      , nextArg = function() { return args[argIndex++]; }\n\
      , slurpNumber = function() {\n\
          var digits = '';\n\
          while (fmt[i].match(/\\d/))\n\
            digits += fmt[i++];\n\
          return digits.length > 0 ? parseInt(digits) : null;\n\
        }\n\
      ;\n\
    for (; i < n; ++i) {\n\
      c = fmt[i];\n\
      if (escaped) {\n\
        escaped = false;\n\
        precision = slurpNumber();\n\
        switch (c) {\n\
        case 'b': // number in binary\n\
          result += parseInt(nextArg(), 10).toString(2);\n\
          break;\n\
        case 'c': // character\n\
          arg = nextArg();\n\
          if (typeof arg === 'string' || arg instanceof String)\n\
            result += arg;\n\
          else\n\
            result += String.fromCharCode(parseInt(arg, 10));\n\
          break;\n\
        case 'd': // number in decimal\n\
          result += parseInt(nextArg(), 10);\n\
          break;\n\
        case 'f': // floating point number\n\
          result += parseFloat(nextArg()).toFixed(precision || 6);\n\
          break;\n\
        case 'o': // number in octal\n\
          result += '0' + parseInt(nextArg(), 10).toString(8);\n\
          break;\n\
        case 's': // string\n\
          result += nextArg();\n\
          break;\n\
        case 'x': // lowercase hexadecimal\n\
          result += '0x' + parseInt(nextArg(), 10).toString(16);\n\
          break;\n\
        case 'X': // uppercase hexadecimal\n\
          result += '0x' + parseInt(nextArg(), 10).toString(16).toUpperCase();\n\
          break;\n\
        default:\n\
          result += c;\n\
          break;\n\
        }\n\
      } else if (c === '%') {\n\
        escaped = true;\n\
      } else {\n\
        result += c;\n\
      }\n\
    }\n\
    return result;\n\
  }\n\
\n\
}());\n\
//@ sourceURL=samsonjs-format/format.js"
));
require.register("rogerz-control-panel-for-angular/index.js", Function("exports, require, module",
"module.exports = require('./module.js');\n\
\n\
require('./directives.js');\n\
require('./services.js');//@ sourceURL=rogerz-control-panel-for-angular/index.js"
));
require.register("rogerz-control-panel-for-angular/module.js", Function("exports, require, module",
"exports = module.exports = angular.module('rogerz/controlPanel', []);\n\
//@ sourceURL=rogerz-control-panel-for-angular/module.js"
));
require.register("rogerz-control-panel-for-angular/services.js", Function("exports, require, module",
"require('./module')\n\
  .service('controlPanel', function () {\n\
    var panels = [],\n\
    activeOne;\n\
\n\
    function activate(index) {\n\
      if (activeOne) {\n\
        activeOne.active = false;\n\
      }\n\
      activeOne = panels[index];\n\
      activeOne.active = true;\n\
      return activeOne;\n\
    }\n\
\n\
    function add(name, icon, tpl, ctx) {\n\
      panels.push({\n\
        name: name,\n\
        iconClass: icon,\n\
        template: tpl,\n\
        ctx: ctx,\n\
        active: false\n\
      });\n\
    }\n\
\n\
    function all() {\n\
      return panels;\n\
    }\n\
\n\
    return {\n\
      all: all,\n\
      add: add,\n\
      activate: activate\n\
    };\n\
  });\n\
//@ sourceURL=rogerz-control-panel-for-angular/services.js"
));
require.register("rogerz-control-panel-for-angular/directives.js", Function("exports, require, module",
"require('./module')\n\
  .directive('controlPanel', function () {\n\
\n\
    function controller($scope, controlPanel) {\n\
      $scope.panels = controlPanel.all();\n\
\n\
      $scope.activate = function (index) {\n\
        var activeOne = controlPanel.activate(index);\n\
\n\
        $scope.template = activeOne.template;\n\
        $scope.ctx = activeOne.ctx;\n\
      };\n\
\n\
      $scope.inactive = false;\n\
\n\
      $scope.toggle = function () {\n\
        $scope.inactive = !$scope.inactive;\n\
      };\n\
    }\n\
\n\
    return {\n\
      restrict: 'E',\n\
      controller: ['$scope', 'controlPanel', controller],\n\
      template: require('./template.html')\n\
    };\n\
  })\n\
  .directive('angularBindTemplate', function ($compile) {\n\
    return function (scope, elem, attrs) {\n\
      scope.$watch(attrs.angularBindTemplate, function (newVal, oldVal) {\n\
        if (newVal && newVal !== oldVal) {\n\
          elem.html(newVal);\n\
          $compile(elem.contents())(scope);\n\
        }\n\
      });\n\
    };\n\
  });\n\
//@ sourceURL=rogerz-control-panel-for-angular/directives.js"
));
require.register("signature-api-legacy-for-angular/lib/index.js", Function("exports, require, module",
"var _ = require('underscore');\n\
var query = require('querystring');\n\
var format = require('format');\n\
\n\
// jshint camelcase: false\n\
\n\
function SignatureApiProvider () {\n\
  // letsface servers from https://github.com/letsface/signature-cluster/wiki/API\n\
  var config = {\n\
      hosts: []\n\
  };\n\
\n\
  this.hosts = function (hosts) {\n\
    config.hosts = hosts;\n\
  };\n\
\n\
  this.$get = function ($http, $timeout, controlPanel) {\n\
    var defaultOpts = {\n\
      m: 'api',\n\
      a: 'do_e_signature_list',\n\
      c_event_id: 118,\n\
      directory: 1\n\
    };\n\
\n\
    var ctx = {\n\
      server: config.hosts[0].address || 'N/A',\n\
      hosts: config.hosts,\n\
      eventId: 118,\n\
      pollInterval: 1000\n\
    };\n\
\n\
    var stat = {};// service stat such as last_id;\n\
    var server;\n\
    var events = {};\n\
    var init = false;\n\
    var timer;\n\
\n\
    /*\n\
     * List signatures\n\
     *\n\
     * @param {String} host host name\n\
     * @param {Object} opts override default options\n\
     * @param {Function} success callback when success\n\
     * @param {Function} error callback when error\n\
     *\n\
     * Example signatureService.list(successFn, errorFn);\n\
     */\n\
    function list(host, opts, success, error) {\n\
\n\
      if (typeof host === 'object') {\n\
        error = success;\n\
        success = opts;\n\
        opts = host;\n\
        host = undefined;\n\
      } else if (typeof host === 'function') {\n\
        error = opts;\n\
        success = host;\n\
        opts = undefined;\n\
        host = undefined;\n\
      }\n\
\n\
      var server = host || ctx.server;\n\
      if (!server) {\n\
        return;\n\
      }\n\
\n\
      opts = opts || {};\n\
      _.defaults(opts, {'c_event_id': ctx.eventId});\n\
      _.defaults(opts, defaultOpts);\n\
\n\
      var url = format('%s/?%s', server, query.stringify(opts));\n\
\n\
      $http.get(url)\n\
             .error(error || function () {})\n\
             .success(function (data) {\n\
               /*\n\
                *  data format from https://github.com/letsface/signature-cluster/wiki/API\n\
                *\n\
[{\n\
\"id\":\"1241\",\n\
\"orig_filename\":\"signatures/1/1.png\",\n\
\"trans_filename\":\"signatures/1/1.png\",\n\
\"signature\":\"2013-11-09 07:23:56\",\n\
\"directory\":\"1\"\n\
},{\n\
\"id\":\"1242\",\n\
\"orig_filename\":\"signatures/1/2.png\",\n\
\"trans_filename\":\"signatures/1/2.png\",\n\
\"signature\":\"2013-11-09 07:25:28\",\n\
\"directory\":\"1\"\n\
}]\n\
\n\
access url\n\
\n\
http://backend.addr/hphoto/signatures/1/1.png\n\
                */\n\
               // format result for signature cloud\n\
\n\
               data = data.map(function (d) {\n\
                 return {\n\
                   id: d.id,\n\
                   href: format('%s/hphoto/%s', server, d.trans_filename),\n\
                   timestamp: d.signature\n\
                 };\n\
               });\n\
               if (data.length) {\n\
                 stat.lastId = data[data.length - 1].id;\n\
               }\n\
               if (success) {\n\
                 success(data);\n\
               }\n\
             });\n\
    }\n\
\n\
    /* submit signature to backend */\n\
    function add() {\n\
      console.log(\"signature added to backend\");\n\
    }\n\
\n\
    /* get update since last query */\n\
    function update(success, error) {\n\
      var opts = {};\n\
      if (stat.lastId) {\n\
        opts.last_id = stat.lastId;\n\
      }\n\
      return list(opts, success, error);\n\
    }\n\
\n\
    function on(event, fn) {\n\
      events[event] = fn;\n\
    }\n\
\n\
    function poll() {\n\
      if (!init) {\n\
        init = true;\n\
        list(events.data);\n\
      } else {\n\
        update(events.data);\n\
      }\n\
      timer = $timeout(poll, ctx.pollInterval);\n\
    }\n\
\n\
    function reset() {\n\
      init = false;\n\
      $timeout.cancel(timer);\n\
      events = {};\n\
    }\n\
\n\
    function option(opts) {\n\
      _.extend(ctx, opts);\n\
    }\n\
\n\
    controlPanel.add('api', 'glyphicon-signal', require('./panel.html'), ctx);\n\
    reset();\n\
\n\
    return {\n\
      on: on,\n\
      config: option,\n\
      list: list,\n\
      update: update,\n\
      add: add,\n\
      poll: poll,\n\
      reset: reset\n\
    };\n\
  };\n\
}\n\
\n\
exports = module.exports = angular.module('letsface/signatureApiLegacy', [\n\
    require('control-panel-for-angular').name\n\
  ])\n\
  .provider('signatureApi', SignatureApiProvider);\n\
//@ sourceURL=signature-api-legacy-for-angular/lib/index.js"
));







require.register("rogerz-control-panel-for-angular/template.html", Function("exports, require, module",
"module.exports = '<div id=\"side-bar\" ng-class=\"{inactive: inactive}\">\\n\
  <ul id=\"sb-hot-zone\">\\n\
    <li>\\n\
      <a id=\"sb-toggle\" ng-click=\"toggle()\">\\n\
        <i class=\"glyphicon glyphicon-cog\"></i>\\n\
      </a>\\n\
    </li>\\n\
  </ul>\\n\
  <ul id=\"sb-tabs\">\\n\
    <li ng-repeat=\"panel in panels\">\\n\
      <a ng-click=\"activate($index)\">\\n\
        <ni class=\"glyphicon {{panel.iconClass || \\'glyphicon-cog\\'}}\"></i>\\n\
      </a>\\n\
    </li>\\n\
  </ul>\\n\
</div>\\n\
<div id=\"control-panel\" ng-hide=\"inactive\">\\n\
  <div angular-bind-template=\"template\"></div>\\n\
</div>\\n\
';//@ sourceURL=rogerz-control-panel-for-angular/template.html"
));
require.register("signature-api-legacy-for-angular/lib/panel.html", Function("exports, require, module",
"module.exports = '<ul class=\"list-group\">\\n\
  <li class=\"list-group-item\">\\n\
    <label>Server</label>\\n\
    <input ng-model=\"ctx.server\" list=\"servers\">\\n\
    <datalist id=\"servers\">\\n\
      <option ng-repeat=\"host in ctx.hosts\" value=\"{{host.address}}\">{{host.name}}</option>      \\n\
    </datalist>\\n\
  </li>\\n\
  <li class=\"list-group-item\">\\n\
    <label>Event ID:</label>\\n\
    <input type=\"text\" ng-model=\"ctx.eventId\"></input>\\n\
  </li>\\n\
  <li class=\"list-group-item\">\\n\
    <label>Polling interval:</label>\\n\
    <input type=\"range\" min=\"1000\" max=\"10000\" step=\"1000\" ng-model=\"ctx.pollInterval\"></input>{{ctx.pollInterval}}ms\\n\
  </li>\\n\
</ul>\\n\
';//@ sourceURL=signature-api-legacy-for-angular/lib/panel.html"
));
require.alias("jashkenas-underscore/underscore.js", "signature-api-legacy-for-angular/deps/underscore/underscore.js");
require.alias("jashkenas-underscore/underscore.js", "signature-api-legacy-for-angular/deps/underscore/index.js");
require.alias("jashkenas-underscore/underscore.js", "underscore/index.js");
require.alias("jashkenas-underscore/underscore.js", "jashkenas-underscore/index.js");
require.alias("component-querystring/index.js", "signature-api-legacy-for-angular/deps/querystring/index.js");
require.alias("component-querystring/index.js", "querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("samsonjs-format/format.js", "signature-api-legacy-for-angular/deps/format/format.js");
require.alias("samsonjs-format/format.js", "signature-api-legacy-for-angular/deps/format/index.js");
require.alias("samsonjs-format/format.js", "format/index.js");
require.alias("samsonjs-format/format.js", "samsonjs-format/index.js");
require.alias("rogerz-control-panel-for-angular/index.js", "signature-api-legacy-for-angular/deps/control-panel-for-angular/index.js");
require.alias("rogerz-control-panel-for-angular/module.js", "signature-api-legacy-for-angular/deps/control-panel-for-angular/module.js");
require.alias("rogerz-control-panel-for-angular/services.js", "signature-api-legacy-for-angular/deps/control-panel-for-angular/services.js");
require.alias("rogerz-control-panel-for-angular/directives.js", "signature-api-legacy-for-angular/deps/control-panel-for-angular/directives.js");
require.alias("rogerz-control-panel-for-angular/index.js", "control-panel-for-angular/index.js");

require.alias("signature-api-legacy-for-angular/lib/index.js", "signature-api-legacy-for-angular/index.js");