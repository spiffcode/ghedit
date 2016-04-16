define(["require", "exports", 'vs/base/common/objects', 'vs/platform/platform', 'vs/base/common/types', 'vs/base/common/json', './configurationRegistry'], function (require, exports, objects, platform, types, json, configurationRegistry) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.CONFIG_DEFAULT_NAME = 'settings';
    function setNode(root, key, value) {
        var segments = key.split('.');
        var last = segments.pop();
        var curr = root;
        segments.forEach(function (s) {
            var obj = curr[s];
            switch (typeof obj) {
                case 'undefined':
                    obj = curr[s] = Object.create(null);
                    break;
                case 'object':
                    break;
                default:
                    console.log('Conflicting configuration setting: ' + key + ' at ' + s + ' with ' + JSON.stringify(obj));
            }
            curr = obj;
        });
        curr[last] = value;
    }
    function newConfigFile(value) {
        try {
            var root = Object.create(null);
            var contents = json.parse(value) || {};
            for (var key in contents) {
                setNode(root, key, contents[key]);
            }
            return {
                contents: root
            };
        }
        catch (e) {
            return {
                contents: {},
                parseError: e
            };
        }
    }
    exports.newConfigFile = newConfigFile;
    function merge(base, add, overwrite) {
        Object.keys(add).forEach(function (key) {
            if (key in base) {
                if (types.isObject(base[key]) && types.isObject(add[key])) {
                    merge(base[key], add[key], overwrite);
                }
                else if (overwrite) {
                    base[key] = add[key];
                }
            }
            else {
                base[key] = add[key];
            }
        });
    }
    exports.merge = merge;
    function consolidate(configMap) {
        var finalConfig = Object.create(null);
        var parseErrors = [];
        var regexp = /\/(team\.)?([^\.]*)*\.json/;
        // For each config file in .vscode folder
        Object.keys(configMap).forEach(function (configFileName) {
            var config = objects.clone(configMap[configFileName]);
            var matches = regexp.exec(configFileName);
            if (!matches || !config) {
                return;
            }
            // If a file is team.foo.json, it indicates team settings, strip this away
            var isTeamSetting = !!matches[1];
            // Extract the config key from the file name (except for settings.json which is the default)
            var configElement = finalConfig;
            if (matches && matches[2] && matches[2] !== exports.CONFIG_DEFAULT_NAME) {
                // Use the name of the file as top level config section for all settings inside
                var configSection = matches[2];
                var element = configElement[configSection];
                if (!element) {
                    element = Object.create(null);
                    configElement[configSection] = element;
                }
                configElement = element;
            }
            merge(configElement, config.contents, !isTeamSetting /* user settings overrule team settings */);
            if (config.parseError) {
                parseErrors.push(configFileName);
            }
        });
        return {
            contents: finalConfig,
            parseErrors: parseErrors
        };
    }
    exports.consolidate = consolidate;
    // defaults...
    function processDefaultValues(withConfig) {
        var configurations = platform.Registry.as(configurationRegistry.Extensions.Configuration).getConfigurations();
        var visit = function (config, isFirst) {
            withConfig(config, isFirst);
            if (Array.isArray(config.allOf)) {
                config.allOf.forEach(function (c) {
                    visit(c, false);
                });
            }
        };
        configurations.sort(function (c1, c2) {
            if (typeof c1.order !== 'number') {
                return 1;
            }
            if (typeof c2.order !== 'number') {
                return -1;
            }
            return c1.order - c2.order;
        }).forEach(function (config) {
            visit(config, true);
        });
    }
    function getDefaultValues() {
        var ret = Object.create(null);
        var handleConfig = function (config, isTop) {
            if (config.properties) {
                Object.keys(config.properties).forEach(function (key) {
                    var prop = config.properties[key];
                    var value = prop.default;
                    if (types.isUndefined(prop.default)) {
                        value = getDefaultValue(prop.type);
                    }
                    setNode(ret, key, value);
                });
            }
        };
        processDefaultValues(handleConfig);
        return ret;
    }
    exports.getDefaultValues = getDefaultValues;
    function getDefaultValuesContent() {
        var lastEntry = -1;
        var result = [];
        result.push('{');
        var handleConfig = function (config, isTop) {
            if (config.title) {
                if (isTop) {
                    result.push('');
                    result.push('\t//-------- ' + config.title + ' --------');
                }
                else {
                    result.push('\t// ' + config.title);
                }
                result.push('');
            }
            if (config.properties) {
                Object.keys(config.properties).forEach(function (key) {
                    var prop = config.properties[key];
                    var defaultValue = prop.default;
                    if (types.isUndefined(defaultValue)) {
                        defaultValue = getDefaultValue(prop.type);
                    }
                    if (prop.description) {
                        result.push('\t// ' + prop.description);
                    }
                    var valueString = JSON.stringify(defaultValue, null, '\t');
                    if (valueString && (typeof defaultValue === 'object')) {
                        valueString = addIndent(valueString);
                    }
                    if (lastEntry !== -1) {
                        result[lastEntry] += ',';
                    }
                    lastEntry = result.length;
                    result.push('\t' + JSON.stringify(key) + ': ' + valueString);
                    result.push('');
                });
            }
        };
        processDefaultValues(handleConfig);
        result.push('}');
        return result.join('\n');
    }
    exports.getDefaultValuesContent = getDefaultValuesContent;
    function addIndent(str) {
        return str.split('\n').join('\n\t');
    }
    function getDefaultValue(type) {
        var t = Array.isArray(type) ? type[0] : type;
        switch (t) {
            case 'boolean':
                return false;
            case 'integer':
                return 0;
            case 'string':
                return '';
            case 'array':
                return [];
            case 'object':
                return {};
            default:
                return null;
        }
    }
});
//# sourceMappingURL=model.js.map