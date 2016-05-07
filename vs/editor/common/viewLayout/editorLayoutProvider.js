define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var EditorLayoutProvider = (function () {
        function EditorLayoutProvider() {
        }
        EditorLayoutProvider.compute = function (opts) {
            var lineNumbersWidth = this.computeLineNumbersWidth(opts);
            var glyphMarginWidth = this.computeGlyphMarginWidth(opts);
            var contentWidth = opts.outerWidth - glyphMarginWidth - lineNumbersWidth - opts.lineDecorationsWidth;
            var glyphMarginLeft = 0;
            var lineNumbersLeft = glyphMarginLeft + glyphMarginWidth;
            var decorationsLeft = lineNumbersLeft + lineNumbersWidth;
            var contentLeft = decorationsLeft + opts.lineDecorationsWidth;
            var verticalArrowSize = (opts.verticalScrollbarHasArrows ? opts.scrollbarArrowSize : 0);
            return {
                width: opts.outerWidth,
                height: opts.outerHeight,
                glyphMarginLeft: glyphMarginLeft,
                glyphMarginWidth: glyphMarginWidth,
                glyphMarginHeight: opts.outerHeight,
                lineNumbersLeft: lineNumbersLeft,
                lineNumbersWidth: lineNumbersWidth,
                lineNumbersHeight: opts.outerHeight,
                decorationsLeft: decorationsLeft,
                decorationsWidth: opts.lineDecorationsWidth,
                decorationsHeight: opts.outerHeight,
                contentLeft: contentLeft,
                contentWidth: contentWidth,
                contentHeight: opts.outerHeight,
                verticalScrollbarWidth: opts.verticalScrollbarWidth,
                horizontalScrollbarHeight: opts.horizontalScrollbarHeight,
                overviewRuler: {
                    top: verticalArrowSize,
                    width: opts.verticalScrollbarWidth,
                    height: (opts.outerHeight - 2 * verticalArrowSize),
                    right: 0
                }
            };
        };
        EditorLayoutProvider.layoutEqual = function (a, b) {
            return (a.width === b.width
                && a.height === b.height
                && a.glyphMarginLeft === b.glyphMarginLeft
                && a.glyphMarginWidth === b.glyphMarginWidth
                && a.glyphMarginHeight === b.glyphMarginHeight
                && a.lineNumbersLeft === b.lineNumbersLeft
                && a.lineNumbersWidth === b.lineNumbersWidth
                && a.lineNumbersHeight === b.lineNumbersHeight
                && a.decorationsLeft === b.decorationsLeft
                && a.decorationsWidth === b.decorationsWidth
                && a.decorationsHeight === b.decorationsHeight
                && a.contentLeft === b.contentLeft
                && a.contentWidth === b.contentWidth
                && a.contentHeight === b.contentHeight
                && a.verticalScrollbarWidth === b.verticalScrollbarWidth
                && a.horizontalScrollbarHeight === b.horizontalScrollbarHeight
                && a.overviewRuler.top === b.overviewRuler.top
                && a.overviewRuler.width === b.overviewRuler.width
                && a.overviewRuler.height === b.overviewRuler.height
                && a.overviewRuler.right === b.overviewRuler.right);
        };
        EditorLayoutProvider.computeGlyphMarginWidth = function (opts) {
            if (opts.showGlyphMargin) {
                return opts.lineHeight;
            }
            return 0;
        };
        EditorLayoutProvider.digitCount = function (n) {
            var r = 0;
            while (n) {
                n = Math.floor(n / 10);
                r++;
            }
            return r ? r : 1;
        };
        EditorLayoutProvider.computeLineNumbersWidth = function (opts) {
            if (opts.showLineNumbers) {
                var digitCount = Math.max(this.digitCount(opts.lineCount), opts.lineNumbersMinChars);
                return Math.round(digitCount * opts.maxDigitWidth);
            }
            return 0;
        };
        return EditorLayoutProvider;
    }());
    exports.EditorLayoutProvider = EditorLayoutProvider;
});
//# sourceMappingURL=editorLayoutProvider.js.map