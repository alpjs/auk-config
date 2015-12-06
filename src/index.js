import { existsSync, readFileSync } from 'fs';
import parseJSON from 'parse-json-object-as-map';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

// To make obj fully immutable, freeze each object in obj.
// Also makes Array, Map and Set read-only.
function deepFreeze(obj) {
    if (obj instanceof Map) {
        obj.clear = obj.delete = obj.set = function() {
            throw new Error('map is read-only');
        };
    } else if (obj instanceof Set) {
        obj.add = obj.clear = obj.delete = function() {
            throw new Error('set is read-only');
        };
    }

    Object.getOwnPropertyNames(obj).forEach((name) => {
        let prop = obj[name];

        // Freeze prop if it is an object
        if (typeof prop == 'object' && !Object.isFrozen(prop)) {
            deepFreeze(prop);
        }
    });

    // Freeze self
    return Object.freeze(obj);
}

function existsConfig(dirname, name) {
    return existsSync(dirname + name + '.json');
}

function loadConfig(dirname, name) {
    let content = readFileSync(dirname + name + '.json');
    return parseJSON(content);
}

export default function aukConfig(dirname) {
    dirname = dirname.replace(/\/*$/, '/');
    return app => {
        app.existsConfig = (name) => existsConfig(dirname, name);
        app.loadConfig = (name) => loadConfig(dirname, name);

        const config = loadConfig(dirname, 'common');
        for (let [key, value] of loadConfig(dirname, app.environment)) {
            config.set(key, value);
        }

        if (existsConfig(dirname, 'local')) {
            for (let [key, value] of loadConfig(dirname, 'local')) {
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
