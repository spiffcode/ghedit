define(["require", "exports", 'vs/editor/common/core/position', 'vs/editor/common/core/range', 'vs/editor/test/common/model/editableTextModelTestUtils'], function (require, exports, position_1, range_1, editableTextModelTestUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var GENERATE_TESTS = false;
    suite('EditorModel Auto Tests', function () {
        function editOp(startLineNumber, startColumn, endLineNumber, endColumn, text) {
            return {
                identifier: null,
                range: new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn),
                text: text.join('\n'),
                forceMoveMarkers: false
            };
        }
        test('auto1', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'ioe',
                '',
                'yjct',
                '',
                '',
            ], [
                editOp(1, 2, 1, 2, ['b', 'r', 'fq']),
                editOp(1, 4, 2, 1, ['', '']),
            ], [
                'ib',
                'r',
                'fqoe',
                '',
                'yjct',
                '',
                '',
            ]);
        });
        test('auto2', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'f',
                'littnhskrq',
                'utxvsizqnk',
                'lslqz',
                'jxn',
                'gmm',
            ], [
                editOp(1, 2, 1, 2, ['', 'o']),
                editOp(2, 4, 2, 4, ['zaq', 'avb']),
                editOp(2, 5, 6, 2, ['jlr', 'zl', 'j']),
            ], [
                'f',
                'o',
                'litzaq',
                'avbtjlr',
                'zl',
                'jmm',
            ]);
        });
        test('auto3', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'ofw',
                'qsxmziuvzw',
                'rp',
                'qsnymek',
                'elth',
                'wmgzbwudxz',
                'iwsdkndh',
                'bujlbwb',
                'asuouxfv',
                'xuccnb',
            ], [
                editOp(4, 3, 4, 3, ['']),
            ], [
                'ofw',
                'qsxmziuvzw',
                'rp',
                'qsnymek',
                'elth',
                'wmgzbwudxz',
                'iwsdkndh',
                'bujlbwb',
                'asuouxfv',
                'xuccnb',
            ]);
        });
        test('auto4', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'fefymj',
                'qum',
                'vmiwxxaiqq',
                'dz',
                'lnqdgorosf',
            ], [
                editOp(1, 3, 1, 5, ['hp']),
                editOp(1, 7, 2, 1, ['kcg', '', 'mpx']),
                editOp(2, 2, 2, 2, ['', 'aw', '']),
                editOp(2, 2, 2, 2, ['vqr', 'mo']),
                editOp(4, 2, 5, 3, ['xyc']),
            ], [
                'fehpmjkcg',
                '',
                'mpxq',
                'aw',
                'vqr',
                'moum',
                'vmiwxxaiqq',
                'dxycqdgorosf',
            ]);
        });
    });
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function getRandomString(minLength, maxLength) {
        var length = getRandomInt(minLength, maxLength);
        var r = '';
        for (var i = 0; i < length; i++) {
            r += String.fromCharCode(getRandomInt('a'.charCodeAt(0), 'z'.charCodeAt(0)));
        }
        return r;
    }
    function generateFile(small) {
        var lineCount = getRandomInt(1, small ? 3 : 10);
        var lines = [];
        for (var i = 0; i < lineCount; i++) {
            lines.push(getRandomString(0, small ? 3 : 10));
        }
        return lines.join('\n');
    }
    function generateEdits(content) {
        var result = [];
        var cnt = getRandomInt(1, 5);
        var maxOffset = content.length;
        while (cnt > 0 && maxOffset > 0) {
            var offset = getRandomInt(0, maxOffset);
            var length_1 = getRandomInt(0, maxOffset - offset);
            var text = generateFile(true);
            result.push({
                offset: offset,
                length: length_1,
                text: text
            });
            maxOffset = offset;
            cnt--;
        }
        result.reverse();
        return result;
    }
    var TestModel = (function () {
        function TestModel() {
            this.initialContent = generateFile(false);
            var edits = generateEdits(this.initialContent);
            var offsetToPosition = TestModel._generateOffsetToPosition(this.initialContent);
            this.edits = [];
            for (var i = 0; i < edits.length; i++) {
                var startPosition = offsetToPosition[edits[i].offset];
                var endPosition = offsetToPosition[edits[i].offset + edits[i].length];
                this.edits.push({
                    identifier: null,
                    range: new range_1.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column),
                    text: edits[i].text,
                    forceMoveMarkers: false
                });
            }
            this.resultingContent = this.initialContent;
            for (var i = edits.length - 1; i >= 0; i--) {
                this.resultingContent = (this.resultingContent.substring(0, edits[i].offset) +
                    edits[i].text +
                    this.resultingContent.substring(edits[i].offset + edits[i].length));
            }
        }
        TestModel._generateOffsetToPosition = function (content) {
            var result = [];
            var lineNumber = 1;
            var column = 1;
            for (var offset = 0, len = content.length; offset <= len; offset++) {
                var ch = content.charAt(offset);
                result[offset] = new position_1.Position(lineNumber, column);
                if (ch === '\n') {
                    lineNumber++;
                    column = 1;
                }
                else {
                    column++;
                }
            }
            return result;
        };
        TestModel.prototype.print = function () {
            var r = [];
            r.push('testApplyEditsWithSyncedModels(');
            r.push('\t[');
            var initialLines = this.initialContent.split('\n');
            r = r.concat(initialLines.map(function (i) { return ("\t\t'" + i + "',"); }));
            r.push('\t],');
            r.push('\t[');
            r = r.concat(this.edits.map(function (i) {
                var text = "['" + i.text.split('\n').join("', '") + "']";
                return "\t\teditOp(" + i.range.startLineNumber + ", " + i.range.startColumn + ", " + i.range.endLineNumber + ", " + i.range.endColumn + ", " + text + "),";
            }));
            r.push('\t],');
            r.push('\t[');
            var resultLines = this.resultingContent.split('\n');
            r = r.concat(resultLines.map(function (i) { return ("\t\t'" + i + "',"); }));
            r.push('\t]');
            r.push(');');
            return r.join('\n');
        };
        return TestModel;
    }());
    if (GENERATE_TESTS) {
        var number = 1;
        while (true) {
            console.log('------BEGIN NEW TEST: ' + number);
            var testModel = new TestModel();
            // console.log(testModel.print());
            console.log('------END NEW TEST: ' + (number++));
            try {
                editableTextModelTestUtils_1.testApplyEditsWithSyncedModels(testModel.initialContent.split('\n'), testModel.edits, testModel.resultingContent.split('\n'));
            }
            catch (err) {
                console.log(err);
                console.log(testModel.print());
                break;
            }
        }
    }
});
//# sourceMappingURL=editableTextModelAuto.test.js.map