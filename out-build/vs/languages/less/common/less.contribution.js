define(["require", "exports", 'vs/platform/platform', 'vs/nls!vs/languages/less/common/less.contribution', 'vs/languages/css/common/services/lintRules', 'vs/editor/common/modes/modesRegistry', 'vs/platform/configuration/common/configurationRegistry', 'vs/css!vs/languages/css/common/css-hover'], function (require, exports, platform, nls, lintRules, modesRegistry_1, ConfigurationRegistry) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    modesRegistry_1.ModesRegistry.registerCompatMode({
        id: 'less',
        extensions: ['.less'],
        aliases: ['Less', 'less'],
        mimetypes: ['text/x-less', 'text/less'],
        moduleId: 'vs/languages/less/common/less',
        ctorName: 'LESSMode'
    });
    var configurationRegistry = platform.Registry.as(ConfigurationRegistry.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': 'less',
        'order': 22,
        'type': 'object',
        'title': nls.localize(0, null),
        'allOf': [{
                'title': nls.localize(1, null),
                'properties': lintRules.getConfigurationProperties('less')
            }]
    });
});
//# sourceMappingURL=less.contribution.js.map