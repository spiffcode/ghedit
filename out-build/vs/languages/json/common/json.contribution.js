define(["require", "exports", 'vs/nls!vs/languages/json/common/json.contribution', 'vs/platform/configuration/common/configurationRegistry', 'vs/platform/platform', 'vs/editor/common/modes/modesRegistry'], function (require, exports, nls, ConfigurationRegistry, Platform, modesRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    modesRegistry_1.ModesRegistry.registerCompatMode({
        id: 'json',
        extensions: ['.json', '.bowerrc', '.jshintrc', '.jscsrc', '.eslintrc'],
        aliases: ['JSON', 'json'],
        mimetypes: ['application/json'],
        moduleId: 'vs/languages/json/common/json',
        ctorName: 'JSONMode'
    });
    var configurationRegistry = Platform.Registry.as(ConfigurationRegistry.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': 'json',
        'order': 20,
        'type': 'object',
        'title': nls.localize(0, null),
        'properties': {
            'json.schemas': {
                'type': 'array',
                'description': nls.localize(1, null),
                'items': {
                    'type': 'object',
                    'defaultSnippets': [{ body: { fileMatch: ['{{/myfile}}'], url: '{{schemaURL}}' } }],
                    'properties': {
                        'url': {
                            'type': 'string',
                            'default': '/user.schema.json',
                            'description': nls.localize(2, null),
                        },
                        'fileMatch': {
                            'type': 'array',
                            'items': {
                                'type': 'string',
                                'default': 'MyFile.json',
                                'description': nls.localize(3, null),
                            },
                            'minItems': 1,
                            'description': nls.localize(4, null),
                        },
                        'schema': {
                            'type': 'object',
                            'description': nls.localize(5, null),
                        },
                    }
                }
            }
        }
    });
});
//# sourceMappingURL=json.contribution.js.map