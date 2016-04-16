/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/base/common/marked/marked'], function (require, exports, marked_1) {
    'use strict';
    function link(href, title, text) {
        return "<a href=\"#\" data-href=\"" + href + "\" title=\"" + (title || text) + "\">" + text + "</a>";
    }
    exports.value = {
        markdownToHtml: function (main, resolve, reject, progress, data) {
            // function highlight(code: string, lang: string, callback?: (error: Error, result: string) => void) {
            // 	main.request('highlight', { code, lang }).then(value => callback(void 0, value), err => callback(err, void 0));
            // }
            var renderer = new marked_1.marked.Renderer();
            renderer.link = link;
            marked_1.marked(data.source, {
                gfm: true,
                sanitize: true,
                renderer: renderer,
            }, function (err, html) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(html);
                }
            });
        }
    };
});
//# sourceMappingURL=simpleMarkedWorker.js.map