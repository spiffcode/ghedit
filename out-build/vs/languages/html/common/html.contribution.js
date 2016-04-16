define(["require", "exports", 'vs/editor/common/modes/modesRegistry', 'vs/nls!vs/languages/html/common/html.contribution', 'vs/platform/platform', 'vs/platform/configuration/common/configurationRegistry'], function (require, exports, modesRegistry_1, nls, platform, ConfigurationRegistry) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    modesRegistry_1.ModesRegistry.registerCompatMode({
        id: 'html',
        extensions: ['.html', '.htm', '.shtml', '.mdoc', '.jsp', '.asp', '.aspx', '.jshtm'],
        aliases: ['HTML', 'htm', 'html', 'xhtml'],
        mimetypes: ['text/html', 'text/x-jshtm', 'text/template', 'text/ng-template'],
        moduleId: 'vs/languages/html/common/html',
        ctorName: 'HTMLMode'
    });
    var configurationRegistry = platform.Registry.as(ConfigurationRegistry.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': 'html',
        'order': 20,
        'type': 'object',
        'title': nls.localize(0, null),
        'properties': {
            'html.format.wrapLineLength': {
                'type': 'integer',
                'default': 120,
                'description': nls.localize(1, null),
            },
            'html.format.unformatted': {
                'type': ['string', 'null'],
                'default': null,
                'description': nls.localize(2, null),
            },
            'html.format.indentInnerHtml': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize(3, null),
            },
            'html.format.preserveNewLines': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize(4, null),
            },
            'html.format.maxPreserveNewLines': {
                'type': ['number', 'null'],
                'default': null,
                'description': nls.localize(5, null),
            },
            'html.format.indentHandlebars': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize(6, null),
            },
            'html.format.endWithNewline': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize(7, null),
            },
            'html.format.extraLiners': {
                'type': ['string', 'null'],
                'default': null,
                'description': nls.localize(8, null),
            },
        }
    });
});
//# sourceMappingURL=html.contribution.js.map