define(["require", "exports", 'vs/nls!vs/languages/css/common/css.contribution', 'vs/platform/platform', 'vs/editor/common/modes/modesRegistry', 'vs/platform/configuration/common/configurationRegistry', 'vs/languages/css/common/services/lintRules', 'vs/css!vs/languages/css/common/css-hover'], function (require, exports, nls, Platform, modesRegistry_1, ConfigurationRegistry, lintRules) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    modesRegistry_1.ModesRegistry.registerCompatMode({
        id: 'css',
        extensions: ['.css'],
        aliases: ['CSS', 'css'],
        mimetypes: ['text/css'],
        moduleId: 'vs/languages/css/common/css',
        ctorName: 'CSSMode'
    });
    var configurationRegistry = Platform.Registry.as(ConfigurationRegistry.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': 'css',
        'order': 20,
        'title': nls.localize(0, null),
        'allOf': [{
                'title': nls.localize(1, null),
                'properties': lintRules.getConfigurationProperties('css')
            }]
    });
});
//# sourceMappingURL=css.contribution.js.map