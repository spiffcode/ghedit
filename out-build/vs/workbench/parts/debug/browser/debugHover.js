/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/lifecycle', 'vs/base/common/winjs.base', 'vs/base/common/errors', 'vs/base/common/keyCodes', 'vs/base/browser/dom', 'vs/nls!vs/workbench/parts/debug/browser/debugHover', 'vs/base/parts/tree/browser/treeImpl', 'vs/base/parts/tree/browser/treeDefaults', 'vs/editor/browser/editorBrowser', 'vs/workbench/parts/debug/common/debugModel', 'vs/workbench/parts/debug/browser/debugViewer'], function (require, exports, lifecycle, winjs_base_1, errors, keyCodes_1, dom, nls, treeImpl_1, treeDefaults_1, editorbrowser, debugModel_1, viewer) {
    "use strict";
    var $ = dom.emmet;
    var debugTreeOptions = {
        indentPixels: 6,
        twistiePixels: 15,
        ariaLabel: nls.localize(0, null)
    };
    var MAX_ELEMENTS_SHOWN = 18;
    var DebugHoverWidget = (function () {
        function DebugHoverWidget(editor, debugService, instantiationService) {
            var _this = this;
            this.editor = editor;
            this.debugService = debugService;
            this.instantiationService = instantiationService;
            // editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this.domNode = $('.debug-hover-widget monaco-editor-background');
            this.treeContainer = dom.append(this.domNode, $('.debug-hover-tree'));
            this.treeContainer.setAttribute('role', 'tree');
            this.tree = new treeImpl_1.Tree(this.treeContainer, {
                dataSource: new viewer.VariablesDataSource(this.debugService),
                renderer: this.instantiationService.createInstance(VariablesHoverRenderer),
                controller: new DebugHoverController(editor)
            }, debugTreeOptions);
            this.toDispose = [];
            this.toDispose.push(this.tree.addListener2('item:expanded', function () {
                _this.layoutTree();
            }));
            this.toDispose.push(this.tree.addListener2('item:collapsed', function () {
                _this.layoutTree();
            }));
            this.toDispose.push(dom.addStandardDisposableListener(this.domNode, 'keydown', function (e) {
                if (e.equals(keyCodes_1.CommonKeybindings.ESCAPE)) {
                    _this.hide();
                }
            }));
            this.valueContainer = dom.append(this.domNode, $('.value'));
            this.valueContainer.tabIndex = 0;
            this.valueContainer.setAttribute('role', 'tooltip');
            this.isVisible = false;
            this.showAtPosition = null;
            this.highlightDecorations = [];
            this.editor.addContentWidget(this);
        }
        DebugHoverWidget.prototype.getId = function () {
            return DebugHoverWidget.ID;
        };
        DebugHoverWidget.prototype.getDomNode = function () {
            return this.domNode;
        };
        DebugHoverWidget.prototype.showAt = function (range, hoveringOver, focus) {
            var _this = this;
            var pos = range.getStartPosition();
            var model = this.editor.getModel();
            var focusedStackFrame = this.debugService.getViewModel().getFocusedStackFrame();
            if (!hoveringOver || !focusedStackFrame || (focusedStackFrame.source.uri.toString() !== model.getAssociatedResource().toString())) {
                return;
            }
            // string magic to get the parents of the variable (a and b for a.b.foo)
            var lineContent = model.getLineContent(pos.lineNumber);
            var namesToFind = lineContent.substring(0, lineContent.indexOf('.' + hoveringOver))
                .split('.').map(function (word) { return word.trim(); }).filter(function (word) { return !!word; });
            namesToFind.push(hoveringOver);
            namesToFind[0] = namesToFind[0].substring(namesToFind[0].lastIndexOf(' ') + 1);
            return this.getExpression(namesToFind).then(function (expression) {
                if (!expression || !expression.available) {
                    _this.hide();
                    return;
                }
                // show it
                _this.highlightDecorations = _this.editor.deltaDecorations(_this.highlightDecorations, [{
                        range: {
                            startLineNumber: pos.lineNumber,
                            endLineNumber: pos.lineNumber,
                            startColumn: lineContent.indexOf(hoveringOver) + 1,
                            endColumn: lineContent.indexOf(hoveringOver) + 1 + hoveringOver.length
                        },
                        options: {
                            className: 'hoverHighlight'
                        }
                    }]);
                return _this.doShow(pos, expression, focus);
            });
        };
        DebugHoverWidget.prototype.getExpression = function (namesToFind) {
            var _this = this;
            var session = this.debugService.getActiveSession();
            var focusedStackFrame = this.debugService.getViewModel().getFocusedStackFrame();
            if (session.capabilities.supportsEvaluateForHovers) {
                return debugModel_1.evaluateExpression(session, focusedStackFrame, new debugModel_1.Expression(namesToFind.join('.'), true), 'hover');
            }
            var variables = [];
            return focusedStackFrame.getScopes(this.debugService).then(function (scopes) {
                // flatten out scopes lists
                return scopes.reduce(function (accum, scopes) { return accum.concat(scopes); }, [])
                    .filter(function (scope) { return !scope.expensive; })
                    .map(function (scope) { return scope.getChildren(_this.debugService).done(function (children) {
                    // look for our variable in the list. First find the parents of the hovered variable if there are any.
                    for (var i = 0; i < namesToFind.length && children; i++) {
                        // some languages pass the type as part of the name, so need to check if the last word of the name matches.
                        var filtered = children.filter(function (v) { return typeof v.name === 'string' && (namesToFind[i] === v.name || namesToFind[i] === v.name.substr(v.name.lastIndexOf(' ') + 1)); });
                        if (filtered.length !== 1) {
                            break;
                        }
                        if (i === namesToFind.length - 1) {
                            variables.push(filtered[0]);
                        }
                        else {
                            filtered[0].getChildren(_this.debugService).done(function (c) { return children = c; }, children = null);
                        }
                    }
                }, errors.onUnexpectedError); });
                // only show if there are no duplicates across scopes
            }).then(function () { return variables.length === 1 ? winjs_base_1.TPromise.as(variables[0]) : winjs_base_1.TPromise.as(null); });
        };
        DebugHoverWidget.prototype.doShow = function (position, expression, focus, forceValueHover) {
            var _this = this;
            if (forceValueHover === void 0) { forceValueHover = false; }
            this.showAtPosition = position;
            this.isVisible = true;
            this.stoleFocus = focus;
            if (expression.reference === 0 || forceValueHover) {
                this.treeContainer.hidden = true;
                this.valueContainer.hidden = false;
                viewer.renderExpressionValue(expression, this.valueContainer, false);
                this.valueContainer.title = '';
                this.editor.layoutContentWidget(this);
                if (focus) {
                    this.editor.render();
                    this.valueContainer.focus();
                }
                return winjs_base_1.TPromise.as(null);
            }
            this.valueContainer.hidden = true;
            this.treeContainer.hidden = false;
            return this.tree.setInput(expression).then(function () {
                _this.layoutTree();
                _this.editor.layoutContentWidget(_this);
                if (focus) {
                    _this.editor.render();
                    _this.tree.DOMFocus();
                }
            });
        };
        DebugHoverWidget.prototype.layoutTree = function () {
            var navigator = this.tree.getNavigator();
            var visibleElementsCount = 0;
            while (navigator.next()) {
                visibleElementsCount++;
            }
            if (visibleElementsCount === 0) {
                this.doShow(this.showAtPosition, this.tree.getInput(), false, true);
            }
            else {
                var height = Math.min(visibleElementsCount, MAX_ELEMENTS_SHOWN) * 18;
                if (this.treeContainer.clientHeight !== height) {
                    this.treeContainer.style.height = height + "px";
                    this.tree.layout();
                }
            }
        };
        DebugHoverWidget.prototype.hide = function () {
            if (!this.isVisible) {
                // already not visible
                return;
            }
            this.isVisible = false;
            this.editor.deltaDecorations(this.highlightDecorations, []);
            this.highlightDecorations = [];
            this.editor.layoutContentWidget(this);
            if (this.stoleFocus) {
                this.editor.focus();
            }
        };
        DebugHoverWidget.prototype.getPosition = function () {
            return this.isVisible ? {
                position: this.showAtPosition,
                preference: [
                    editorbrowser.ContentWidgetPositionPreference.ABOVE,
                    editorbrowser.ContentWidgetPositionPreference.BELOW
                ]
            } : null;
        };
        DebugHoverWidget.prototype.dispose = function () {
            this.toDispose = lifecycle.dispose(this.toDispose);
        };
        DebugHoverWidget.ID = 'debug.hoverWidget';
        return DebugHoverWidget;
    }());
    exports.DebugHoverWidget = DebugHoverWidget;
    var DebugHoverController = (function (_super) {
        __extends(DebugHoverController, _super);
        function DebugHoverController(editor) {
            _super.call(this);
            this.editor = editor;
        }
        /* protected */ DebugHoverController.prototype.onLeftClick = function (tree, element, eventish, origin) {
            if (origin === void 0) { origin = 'mouse'; }
            if (element.reference > 0) {
                _super.prototype.onLeftClick.call(this, tree, element, eventish, origin);
                tree.clearFocus();
                tree.deselect(element);
                this.editor.focus();
            }
            return true;
        };
        return DebugHoverController;
    }(treeDefaults_1.DefaultController));
    var VariablesHoverRenderer = (function (_super) {
        __extends(VariablesHoverRenderer, _super);
        function VariablesHoverRenderer() {
            _super.apply(this, arguments);
        }
        VariablesHoverRenderer.prototype.getHeight = function (tree, element) {
            return 18;
        };
        return VariablesHoverRenderer;
    }(viewer.VariablesRenderer));
});
//# sourceMappingURL=debugHover.js.map