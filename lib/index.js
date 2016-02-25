'use strict';

var _slicedToArray = /**
                      * @function
                     */ function () { /**
                                       * @function
                                       * @param arr
                                       * @param i
                                      */ function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return (/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @function
                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @param arr
                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @param i
                                                                                                                                                                                                                                                                                                                                                                                                                                                          */ function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } } ); }();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = aukConfig;

var _fs = require('fs');

var _parseJsonObjectAsMap = require('parse-json-object-as-map');

var _parseJsonObjectAsMap2 = _interopRequireDefault(_parseJsonObjectAsMap);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

/**
 * @function
 * @param obj
*/
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const argv = (0, _minimist2.default)(process.argv.slice(2));

// To make obj fully immutable, freeze each object in obj.
// Also makes Array, Map and Set read-only.
/**
 * @function
 * @param obj
*/function deepFreeze(obj) {
    if (obj instanceof Map) {
        obj.clear = obj.delete = obj.set = /**
                                            * @function
                                           */function () {
            throw new Error('map is read-only');
        };
    } else if (obj instanceof Set) {
        obj.add = obj.clear = obj.delete = /**
                                            * @function
                                           */function () {
            throw new Error('set is read-only');
        };
    }

    Object.getOwnPropertyNames(obj).forEach(name => {
        let prop = obj[name];

        // Freeze prop if it is an object
        if (typeof prop == 'object' && !Object.isFrozen(prop)) {
            deepFreeze(prop);
        }
    });

    // Freeze self
    return Object.freeze(obj);
}

/**
 * @function
 * @param dirname
 * @param name
*/function existsConfig(dirname, name) {
    return (0, _fs.existsSync)(`${ dirname }${ name }.json`);
}

/**
 * @function
 * @param dirname
 * @param name
*/function loadConfig(dirname, name) {
    let content = (0, _fs.readFileSync)(`${ dirname }${ name }.json`);
    return (0, _parseJsonObjectAsMap2.default)(content);
}

/**
 * @function
 * @param dirname
 * @param options
*/function aukConfig(dirname) {
    let options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    dirname = dirname.replace(/\/*$/, '/');

    options = Object.assign({}, options, {
        argv: []
    });

    return app => {
        app.existsConfig = name => existsConfig(dirname, name);
        app.loadConfig = name => loadConfig(dirname, name);

        const config = loadConfig(dirname, 'common');
        for (let _ref of loadConfig(dirname, app.env)) {
            var _ref2 = _slicedToArray(_ref, 2);

            let key = _ref2[0];
            let value = _ref2[1];

            config.set(key, value);
        }

        if (existsConfig(dirname, 'local')) {
            for (let _ref3 of loadConfig(dirname, 'local')) {
                var _ref4 = _slicedToArray(_ref3, 2);

                let key = _ref4[0];
                let value = _ref4[1];

                config.set(key, value);
            }
        }

        if (!config.has('version')) {
            config.set('version', argv.version || options.packageConfig.version);
        }

        let socketPath = argv['socket-path'] || argv.socketPath;
        if (socketPath) {
            config.set('socketPath', socketPath);
        } else if (argv.port) {
            config.set('port', argv.port);
            config.delete('socketPath');
        }

        options.argv.forEach(key => {
            if (argv[key] !== undefined) {
                config.set(key, argv[key]);
            }
        });

        app.config = config;
        app.context.config = config;
        app.context.production = !!config.get('production');

        return deepFreeze(config);
    };
}
//# sourceMappingURL=index.js.map