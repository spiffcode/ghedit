var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/editor/common/viewModel/viewEventHandler', 'vs/editor/browser/viewParts/overviewRuler/overviewRulerImpl'], function (require, exports, viewEventHandler_1, overviewRulerImpl_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var OverviewRuler = (function (_super) {
        __extends(OverviewRuler, _super);
        function OverviewRuler(context, cssClassName, scrollHeight, minimumHeight, maximumHeight, getVerticalOffsetForLine) {
            _super.call(this);
            this._context = context;
            this._overviewRuler = new overviewRulerImpl_1.OverviewRulerImpl(0, cssClassName, scrollHeight, this._context.configuration.editor.lineHeight, minimumHeight, maximumHeight, getVerticalOffsetForLine);
            this._context.addEventHandler(this);
        }
        OverviewRuler.prototype.destroy = function () {
            this.dispose();
        };
        OverviewRuler.prototype.dispose = function () {
            this._context.removeEventHandler(this);
            this._overviewRuler.dispose();
        };
        OverviewRuler.prototype.onConfigurationChanged = function (e) {
            if (e.lineHeight) {
                this._overviewRuler.setLineHeight(this._context.configuration.editor.lineHeight, true);
                return true;
            }
            return false;
        };
        OverviewRuler.prototype.onZonesChanged = function () {
            return true;
        };
        OverviewRuler.prototype.onModelFlushed = function () {
            return true;
        };
        OverviewRuler.prototype.onScrollHeightChanged = function (scrollHeight) {
            this._overviewRuler.setScrollHeight(scrollHeight, true);
            return true;
        };
        OverviewRuler.prototype.getDomNode = function () {
            return this._overviewRuler.getDomNode();
        };
        OverviewRuler.prototype.setLayout = function (position) {
            this._overviewRuler.setLayout(position, true);
        };
        OverviewRuler.prototype.setZones = function (zones) {
            this._overviewRuler.setZones(zones, true);
        };
        return OverviewRuler;
    }(viewEventHandler_1.ViewEventHandler));
    exports.OverviewRuler = OverviewRuler;
});
