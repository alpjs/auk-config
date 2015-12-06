'use strict';

var _Map = require('babel-runtime/core-js/map').default;

var _Set = require('babel-runtime/core-js/set').default;

var _Object$getOwnPropertyNames = require('babel-runtime/core-js/object/get-own-property-names').default;

var _Object$isFrozen = require('babel-runtime/core-js/object/is-frozen').default;

var _Object$freeze = require('babel-runtime/core-js/object/freeze').default;

var _getIterator = require('babel-runtime/core-js/get-iterator').default;

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.default = aukConfig;

var _fs = require('fs');

var _parseJsonObjectAsMap = require('parse-json-object-as-map');

var _parseJsonObjectAsMap2 = _interopRequireDefault(_parseJsonObjectAsMap);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

const argv = (0, _minimist2.default)(process.argv.slice(2));

// To make obj fully immutable, freeze each object in obj.
// Also makes Array, Map and Set read-only.
/** @function 
* @param obj */function deepFreeze(obj) {
    if (obj instanceof _Map) {
        obj.clear = obj.delete = obj.set = /** @function */function () {
            throw new Error('map is read-only');
        };
    } else if (obj instanceof _Set) {
        obj.add = obj.clear = obj.delete = /** @function */function () {
            throw new Error('set is read-only');
        };
    }

    _Object$getOwnPropertyNames(obj).forEach(function (name) {
        let prop = obj[name];

        // Freeze prop if it is an object
        if (typeof prop == 'object' && !_Object$isFrozen(prop)) {
            deepFreeze(prop);
        }
    });

    // Freeze self
    return _Object$freeze(obj);
}

/** @function 
* @param dirname 
* @param name */function existsConfig(dirname, name) {
    return (0, _fs.existsSync)(dirname + name + '.json');
}

/** @function 
* @param dirname 
* @param name */function loadConfig(dirname, name) {
    let content = (0, _fs.readFileSync)(dirname + name + '.json');
    return (0, _parseJsonObjectAsMap2.default)(content);
}

/** @function 
* @param dirname */
function aukConfig(dirname) {
    dirname = dirname.replace(/\/*$/, '/');
    return function (app) {
        app.existsConfig = function (name) {
            return existsConfig(dirname, name);
        };
        app.loadConfig = function (name) {
            return loadConfig(dirname, name);
        };

        const config = loadConfig(dirname, 'common');
        for (var _iterator = loadConfig(dirname, app.environment), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _getIterator(_iterator);;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            let key = _ref[0];
            let value = _ref[1];

            config.set(key, value);
        }

        if (existsConfig(dirname, 'local')) {
            for (var _iterator2 = loadConfig(dirname, 'local'), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _getIterator(_iterator2);;) {
                var _ref2;

                if (_isArray2) {
                    if (_i2 >= _iterator2.length) break;
                    _ref2 = _iterator2[_i2++];
                } else {
                    _i2 = _iterator2.next();
                    if (_i2.done) break;
                    _ref2 = _i2.value;
                }

                let key = _ref2[0];
                let value = _ref2[1];

                config.set(key, value);
            }
        }

        let socketPath = argv['socket-path'] || argv.socketPath;
        if (socketPath) {
            config.set('socketPath', socketPath);
        } else if (argv.port) {
            config.set('port', argv.port);
            config.delete('socketPath');
        }

        app.config = config;
        app.context.config = config;
        app.context.production = !!config.get('production');

        return deepFreeze(config);
    };
}

module.exports = exports.default;
//# sourceMappingURL=index.js.map