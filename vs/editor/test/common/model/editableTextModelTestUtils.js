define(["require", "exports", 'assert', 'vs/editor/common/editorCommon', 'vs/editor/common/model/editableTextModel', 'vs/editor/common/model/mirrorModel', 'vs/editor/common/model/mirrorModel2', 'vs/editor/common/model/textModel'], function (require, exports, assert, editorCommon, editableTextModel_1, mirrorModel_1, mirrorModel2_1, textModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function testApplyEditsWithSyncedModels(original, edits, expected) {
        var originalStr = original.join('\n');
        var expectedStr = expected.join('\n');
        assertSyncedModels(originalStr, function (model, assertMirrorModels) {
            // Apply edits & collect inverse edits
            var inverseEdits = model.applyEdits(edits);
            // Assert edits produced expected result
            assert.deepEqual(model.getValue(editorCommon.EndOfLinePreference.LF), expectedStr);
            assertMirrorModels();
            // Apply the inverse edits
            var inverseInverseEdits = model.applyEdits(inverseEdits);
            // Assert the inverse edits brought back model to original state
            assert.deepEqual(model.getValue(editorCommon.EndOfLinePreference.LF), originalStr);
            // Assert the inverse of the inverse edits are the original edits
            assert.deepEqual(inverseInverseEdits, edits);
            assertMirrorModels();
        });
    }
    exports.testApplyEditsWithSyncedModels = testApplyEditsWithSyncedModels;
    function assertSyncedModels(text, callback, setup) {
        if (setup === void 0) { setup = null; }
        var model = new editableTextModel_1.EditableTextModel([], textModel_1.TextModel.toRawText(text, textModel_1.TextModel.DEFAULT_CREATION_OPTIONS), null);
        model.setEOL(editorCommon.EndOfLineSequence.LF);
        if (setup) {
            setup(model);
        }
        var mirrorModel1 = new mirrorModel_1.MirrorModel(null, model.getVersionId(), model.toRawText(), null);
        var mirrorModel1PrevVersionId = model.getVersionId();
        var mirrorModel2 = new mirrorModel2_1.MirrorModel2(null, model.toRawText().lines, model.toRawText().EOL, model.getVersionId());
        var mirrorModel2PrevVersionId = model.getVersionId();
        model.addListener(editorCommon.EventType.ModelContentChanged, function (e) {
            var versionId = e.versionId;
            if (versionId < mirrorModel1PrevVersionId) {
                console.warn('Model version id did not advance between edits (1)');
            }
            mirrorModel1PrevVersionId = versionId;
            var mirrorModelEvents = {
                contentChanged: [e]
            };
            mirrorModel1.onEvents(mirrorModelEvents);
        });
        model.addListener(editorCommon.EventType.ModelContentChanged2, function (e) {
            var versionId = e.versionId;
            if (versionId < mirrorModel2PrevVersionId) {
                console.warn('Model version id did not advance between edits (2)');
            }
            mirrorModel2PrevVersionId = versionId;
            mirrorModel2.onEvents([e]);
        });
        var assertMirrorModels = function () {
            model._assertLineNumbersOK();
            assert.equal(mirrorModel2.getText(), model.getValue(), 'mirror model 2 text OK');
            assert.equal(mirrorModel2.version, model.getVersionId(), 'mirror model 2 version OK');
            assert.equal(mirrorModel1.getValue(), model.getValue(), 'mirror model 1 text OK');
            assert.equal(mirrorModel1.getVersionId(), model.getVersionId(), 'mirror model 1 version OK');
        };
        callback(model, assertMirrorModels);
        model.dispose();
        mirrorModel1.dispose();
        mirrorModel2.dispose();
    }
    exports.assertSyncedModels = assertSyncedModels;
});
//# sourceMappingURL=editableTextModelTestUtils.js.map