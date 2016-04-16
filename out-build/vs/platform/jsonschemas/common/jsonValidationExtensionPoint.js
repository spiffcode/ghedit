define(["require", "exports", 'vs/nls!vs/platform/jsonschemas/common/jsonValidationExtensionPoint', 'vs/platform/extensions/common/extensionsRegistry', 'vs/platform/platform', 'vs/base/common/uri', 'vs/platform/jsonschemas/common/jsonContributionRegistry', 'vs/base/common/strings', 'vs/base/common/paths'], function (require, exports, nls, extensionsRegistry_1, platform_1, uri_1, JSONContributionRegistry, strings, paths) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var schemaRegistry = platform_1.Registry.as(JSONContributionRegistry.Extensions.JSONContribution);
    var configurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('jsonValidation', {
        description: nls.localize(0, null),
        type: 'array',
        defaultSnippets: [{ body: [{ fileMatch: '{{file.json}}', url: '{{url}}' }] }],
        items: {
            type: 'object',
            defaultSnippets: [{ body: { fileMatch: '{{file.json}}', url: '{{url}}' } }],
            properties: {
                fileMatch: {
                    type: 'string',
                    description: nls.localize(1, null),
                },
                url: {
                    description: nls.localize(2, null),
                    type: 'string'
                }
            }
        }
    });
    var JSONValidationExtensionPoint = (function () {
        function JSONValidationExtensionPoint() {
            configurationExtPoint.setHandler(function (extensions) {
                for (var i = 0; i < extensions.length; i++) {
                    var extensionValue = extensions[i].value;
                    var collector = extensions[i].collector;
                    var extensionPath = extensions[i].description.extensionFolderPath;
                    if (!extensionValue || !Array.isArray(extensionValue)) {
                        collector.error(nls.localize(3, null));
                        return;
                    }
                    extensionValue.forEach(function (extension) {
                        if (typeof extension.fileMatch !== 'string') {
                            collector.error(nls.localize(4, null));
                            return;
                        }
                        var uri = extension.url;
                        if (typeof extension.url !== 'string') {
                            collector.error(nls.localize(5, null));
                            return;
                        }
                        if (strings.startsWith(uri, './')) {
                            try {
                                uri = uri_1.default.file(paths.normalize(paths.join(extensionPath, uri))).toString();
                            }
                            catch (e) {
                                collector.error(nls.localize(6, null, e.message));
                            }
                        }
                        else if (!strings.startsWith(uri, 'https:/') && strings.startsWith(uri, 'https:/')) {
                            collector.error(nls.localize(7, null));
                            return;
                        }
                        var fileMatch = extension.fileMatch;
                        if (!strings.startsWith(extension.fileMatch, '/')) {
                            fileMatch = '/' + fileMatch;
                        }
                        schemaRegistry.addSchemaFileAssociation(fileMatch, uri);
                    });
                }
            });
        }
        return JSONValidationExtensionPoint;
    }());
    exports.JSONValidationExtensionPoint = JSONValidationExtensionPoint;
});
//# sourceMappingURL=jsonValidationExtensionPoint.js.map