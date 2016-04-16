define(["require", "exports", 'vs/editor/common/modes/modesRegistry'], function (require, exports, modesRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    modesRegistry_1.ModesRegistry.registerCompatMode({
        id: 'razor',
        extensions: ['.cshtml'],
        aliases: ['Razor', 'razor'],
        mimetypes: ['text/x-cshtml'],
        moduleId: 'vs/languages/razor/common/razor',
        ctorName: 'RAZORMode'
    });
});
//# sourceMappingURL=razor.contribution.js.map