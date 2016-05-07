define(["require", "exports", 'vs/editor/common/modes/modesRegistry', 'vs/platform/platform', 'vs/nls', 'vs/languages/css/common/services/lintRules', 'vs/platform/configuration/common/configurationRegistry', 'vs/css!vs/languages/css/common/css-hover'], function (require, exports, modesRegistry_1, Platform, nls, LintRules, ConfigurationRegistry) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    modesRegistry_1.ModesRegistry.registerCompatMode({
        id: 'sass',
        extensions: ['.scss'],
        aliases: ['Sass', 'sass', 'scss'],
        mimetypes: ['text/x-scss', 'text/scss'],
        moduleId: 'vs/languages/sass/common/sass',
        ctorName: 'SASSMode'
    });
    var configurationRegistry = Platform.Registry.as(ConfigurationRegistry.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': 'sass',
        'order': 24,
        'title': nls.localize('sassConfigurationTitle', "Sass configuration"),
        'allOf': [{
                'title': nls.localize('sassLint', "Controls Sass validation and problem severities."),
                'properties': LintRules.getConfigurationProperties('sass')
            }]
    });
});
//# sourceMappingURL=sass.contribution.js.map