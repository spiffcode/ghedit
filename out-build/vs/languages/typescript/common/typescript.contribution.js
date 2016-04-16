define(["require", "exports", 'vs/editor/browser/standalone/standaloneCodeEditor'], function (require, exports, standaloneCodeEditor_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    // ----- Registration and Configuration --------------------------------------------------------
    standaloneCodeEditor_1.registerStandaloneLanguage({
        id: 'typescript',
        extensions: ['.ts'],
        aliases: ['TypeScript', 'ts', 'typescript'],
        mimetypes: ['text/typescript'],
    }, 'vs/languages/typescript/common/mode');
    standaloneCodeEditor_1.registerStandaloneLanguage({
        id: 'javascript',
        extensions: ['.js', '.es6'],
        firstLine: '^#!.*\\bnode',
        filenames: ['jakefile'],
        aliases: ['JavaScript', 'javascript', 'js'],
        mimetypes: ['text/javascript'],
    }, 'vs/languages/typescript/common/mode');
});
//# sourceMappingURL=typescript.contribution.js.map