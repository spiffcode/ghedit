/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/uri', 'vs/base/common/winjs.base', 'vs/editor/common/core/range', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/modes', 'vs/editor/common/services/modelService'], function (require, exports, errors_1, uri_1, winjs_base_1, range_1, editorCommonExtensions_1, modes_1, modelService_1) {
    'use strict';
    function getOutlineEntries(model) {
        var groupLabels = Object.create(null);
        var entries = [];
        var promises = modes_1.OutlineRegistry.all(model).map(function (support) {
            if (support.outlineGroupLabel) {
                var keys = Object.keys(support.outlineGroupLabel);
                for (var i = 0, len = keys.length; i < len; i++) {
                    var key = keys[i];
                    groupLabels[key] = support.outlineGroupLabel[key];
                }
            }
            return support.getOutline(model.getAssociatedResource()).then(function (result) {
                if (Array.isArray(result)) {
                    entries.push.apply(entries, result);
                }
            }, function (err) {
                errors_1.onUnexpectedError(err);
            });
        });
        return winjs_base_1.TPromise.join(promises).then(function () {
            var flatEntries = [];
            flatten(flatEntries, entries, '');
            flatEntries.sort(compareEntriesUsingStart);
            return {
                entries: flatEntries,
                outlineGroupLabel: groupLabels
            };
        });
    }
    exports.getOutlineEntries = getOutlineEntries;
    function compareEntriesUsingStart(a, b) {
        return range_1.Range.compareRangesUsingStarts(range_1.Range.lift(a.range), range_1.Range.lift(b.range));
    }
    function flatten(bucket, entries, overrideContainerLabel) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            bucket.push({
                type: entry.type,
                range: entry.range,
                label: entry.label,
                icon: entry.icon,
                containerLabel: entry.containerLabel || overrideContainerLabel
            });
            if (entry.children) {
                flatten(bucket, entry.children, entry.label);
            }
        }
    }
    editorCommonExtensions_1.CommonEditorRegistry.registerLanguageCommand('_executeDocumentSymbolProvider', function (accessor, args) {
        var resource = args.resource;
        if (!(resource instanceof uri_1.default)) {
            throw errors_1.illegalArgument('resource');
        }
        var model = accessor.get(modelService_1.IModelService).getModel(resource);
        if (!model) {
            throw errors_1.illegalArgument('resource');
        }
        return getOutlineEntries(model);
    });
});
//# sourceMappingURL=quickOpen.js.map