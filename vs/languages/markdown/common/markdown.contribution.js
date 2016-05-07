define(["require", "exports", 'vs/nls!vs/languages/markdown/common/markdown.contribution', 'vs/editor/common/modes/modesRegistry', 'vs/platform/configuration/common/configurationRegistry', 'vs/platform/platform'], function (require, exports, nls, modesRegistry_1, ConfigurationRegistry, Platform) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    modesRegistry_1.ModesRegistry.registerCompatMode({
        id: 'markdown',
        extensions: ['.md', '.markdown', '.mdown', '.mkdn', '.mkd', '.mdwn', '.mdtxt', '.mdtext'],
        aliases: ['Markdown', 'markdown'],
        mimetypes: ['text/x-web-markdown'],
        moduleId: 'vs/languages/markdown/common/markdown',
        ctorName: 'MarkdownMode'
    });
    // Configuration
    var configurationRegistry = Platform.Registry.as(ConfigurationRegistry.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': 'markdown',
        'order': 20,
        'type': 'object',
        'title': nls.localize(0, null),
        'properties': {
            'markdown.styles': {
                'type': 'array',
                'description': nls.localize(1, null),
                'items': {
                    'type': 'string'
                }
            }
        }
    });
});
//# sourceMappingURL=markdown.contribution.js.map