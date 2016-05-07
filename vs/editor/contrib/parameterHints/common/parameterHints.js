/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/winjs.base', 'vs/editor/common/editorCommonExtensions', 'vs/editor/common/modes'], function (require, exports, errors_1, winjs_base_1, editorCommonExtensions_1, modes_1) {
    'use strict';
    function getParameterHints(model, position, triggerCharacter) {
        var support = modes_1.ParameterHintsRegistry.ordered(model)[0];
        if (!support) {
            return winjs_base_1.TPromise.as(undefined);
        }
        return support.getParameterHints(model.getAssociatedResource(), position, triggerCharacter);
    }
    exports.getParameterHints = getParameterHints;
    editorCommonExtensions_1.CommonEditorRegistry.registerDefaultLanguageCommand('_executeSignatureHelpProvider', function (model, position, args) {
        var triggerCharacter = args.triggerCharacter;
        if (triggerCharacter && typeof triggerCharacter !== 'string') {
            throw errors_1.illegalArgument('triggerCharacter');
        }
        return getParameterHints(model, position, triggerCharacter);
    });
});
//# sourceMappingURL=parameterHints.js.map