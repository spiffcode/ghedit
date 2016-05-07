define(["require", "exports", 'vs/editor/common/modes', 'vs/languages/typescript/common/tokenization', 'vs/editor/common/modes/abstractMode', 'vs/editor/common/modes/supports/richEditSupport', 'vs/editor/common/services/modelService', 'vs/editor/common/services/modeService', 'vs/platform/markers/common/markers', './typescript', './languageFeatures', 'vs/languages/typescript/common/workerManager'], function (require, exports, modes, tokenization_1, abstractMode_1, richEditSupport_1, modelService_1, modeService_1, markers_1, typescript_1, languageFeatures_1, workerManager) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function setupMode(modelService, markerService, modeService, defaults, modeId, language) {
        var disposables = [];
        var client = workerManager.create(defaults, modelService);
        disposables.push(client);
        var registration = languageFeatures_1.register(modelService, markerService, modeId, defaults, function (first) {
            var more = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                more[_i - 1] = arguments[_i];
            }
            return client.getLanguageServiceWorker.apply(client, [first].concat(more));
        });
        disposables.push(registration);
        disposables.push(modeService.registerRichEditSupport(modeId, richEditConfiguration));
        disposables.push(modeService.registerTokenizationSupport(modeId, function (mode) {
            return tokenization_1.createTokenizationSupport(mode, language);
        }));
    }
    var richEditConfiguration = {
        wordPattern: abstractMode_1.createWordRegExp('$'),
        comments: {
            lineComment: '//',
            blockComment: ['/*', '*/']
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')']
        ],
        onEnterRules: [
            {
                // e.g. /** | */
                beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                afterText: /^\s*\*\/$/,
                action: { indentAction: modes.IndentAction.IndentOutdent, appendText: ' * ' }
            },
            {
                // e.g. /** ...|
                beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                action: { indentAction: modes.IndentAction.None, appendText: ' * ' }
            },
            {
                // e.g.  * ...|
                beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                action: { indentAction: modes.IndentAction.None, appendText: '* ' }
            },
            {
                // e.g.  */|
                beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                action: { indentAction: modes.IndentAction.None, removeText: 1 }
            }
        ],
        __electricCharacterSupport: {
            docComment: { scope: 'comment.doc', open: '/**', lineStart: ' * ', close: ' */' }
        },
        __characterPairSupport: {
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"', notIn: ['string'] },
                { open: '\'', close: '\'', notIn: ['string', 'comment'] },
                { open: '`', close: '`' }
            ]
        }
    };
    function createRichEditSupport(modeId) {
        return new richEditSupport_1.RichEditSupport(modeId, null, richEditConfiguration);
    }
    exports.createRichEditSupport = createRichEditSupport;
    var isActivated = false;
    function activate(ctx) {
        if (isActivated) {
            return;
        }
        isActivated = true;
        var modelService = ctx.get(modelService_1.IModelService);
        var markerService = ctx.get(markers_1.IMarkerService);
        var modeService = ctx.get(modeService_1.IModeService);
        setupMode(modelService, markerService, modeService, typescript_1.typeScriptDefaults, 'typescript', tokenization_1.Language.TypeScript);
        setupMode(modelService, markerService, modeService, typescript_1.javaScriptDefaults, 'javascript', tokenization_1.Language.EcmaScript5);
    }
    exports.activate = activate;
});
//# sourceMappingURL=mode.js.map