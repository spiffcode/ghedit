define(["require", "exports", 'vs/editor/common/modes/modesRegistry'], function (require, exports, modesRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    modesRegistry_1.ModesRegistry.registerCompatMode({
        id: 'php',
        extensions: ['.php', '.php4', '.php5', '.phtml', '.ctp'],
        aliases: ['PHP', 'php'],
        mimetypes: ['application/x-php'],
        moduleId: 'vs/languages/php/common/php',
        ctorName: 'PHPMode'
    });
});
//# sourceMappingURL=php.contribution.js.map