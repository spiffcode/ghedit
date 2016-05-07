/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/common/winjs.base', 'vs/nls!vs/workbench/parts/debug/common/debugModel', 'vs/base/common/lifecycle', 'vs/base/common/eventEmitter', 'vs/base/common/uuid', 'vs/base/common/types', 'vs/base/common/arrays', 'vs/workbench/parts/debug/common/debug', 'vs/workbench/parts/debug/common/debugSource'], function (require, exports, winjs_base_1, nls, lifecycle, ee, uuid, types, arrays, debug, debugSource_1) {
    "use strict";
    var MAX_REPL_LENGTH = 10000;
    function resolveChildren(debugService, parent) {
        var session = debugService.getActiveSession();
        // only variables with reference > 0 have children.
        if (!session || parent.reference <= 0) {
            return winjs_base_1.TPromise.as([]);
        }
        return session.variables({ variablesReference: parent.reference }).then(function (response) {
            return arrays.distinct(response.body.variables.filter(function (v) { return !!v; }), function (v) { return v.name; }).map(function (v) { return new Variable(parent, v.variablesReference, v.name, v.value); });
        }, function (e) { return [new Variable(parent, 0, null, e.message, false)]; });
    }
    function massageValue(value) {
        return value ? value.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') : value;
    }
    function evaluateExpression(session, stackFrame, expression, context) {
        if (!session) {
            expression.value = context === 'repl' ? nls.localize(0, null) : Expression.DEFAULT_VALUE;
            expression.available = false;
            expression.reference = 0;
            return winjs_base_1.TPromise.as(expression);
        }
        return session.evaluate({
            expression: expression.name,
            frameId: stackFrame ? stackFrame.frameId : undefined,
            context: context
        }).then(function (response) {
            expression.available = !!response.body;
            if (response.body) {
                expression.value = response.body.result;
                expression.reference = response.body.variablesReference;
            }
            return expression;
        }, function (err) {
            expression.value = err.message;
            expression.available = false;
            expression.reference = 0;
            return expression;
        });
    }
    exports.evaluateExpression = evaluateExpression;
    var notPropertySyntax = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    var arrayElementSyntax = /\[.*\]$/;
    function getFullExpressionName(expression, sessionType) {
        var names = [expression.name];
        if (expression instanceof Variable) {
            var v = expression.parent;
            while (v instanceof Variable || v instanceof Expression) {
                names.push(v.name);
                v = v.parent;
            }
        }
        names = names.reverse();
        var result = null;
        names.forEach(function (name) {
            if (!result) {
                result = name;
            }
            else if (arrayElementSyntax.test(name) || (sessionType === 'node' && !notPropertySyntax.test(name))) {
                // use safe way to access node properties a['property_name']. Also handles array elements.
                result = name && name.indexOf('[') === 0 ? "" + result + name : result + "['" + name + "']";
            }
            else {
                result = result + "." + name;
            }
        });
        return result;
    }
    exports.getFullExpressionName = getFullExpressionName;
    var Thread = (function () {
        function Thread(name, threadId) {
            this.name = name;
            this.threadId = threadId;
            this.promisedCallStack = undefined;
            this.stoppedDetails = undefined;
            this.cachedCallStack = undefined;
            this.stopped = false;
        }
        Thread.prototype.getId = function () {
            return "thread:" + this.name + ":" + this.threadId;
        };
        Thread.prototype.clearCallStack = function () {
            this.promisedCallStack = undefined;
            this.cachedCallStack = undefined;
        };
        Thread.prototype.getCachedCallStack = function () {
            return this.cachedCallStack;
        };
        Thread.prototype.getCallStack = function (debugService, getAdditionalStackFrames) {
            var _this = this;
            if (getAdditionalStackFrames === void 0) { getAdditionalStackFrames = false; }
            if (!this.stopped) {
                return winjs_base_1.TPromise.as([]);
            }
            if (!this.promisedCallStack) {
                this.promisedCallStack = this.getCallStackImpl(debugService, 0).then(function (callStack) {
                    _this.cachedCallStack = callStack;
                    return callStack;
                });
            }
            else if (getAdditionalStackFrames) {
                this.promisedCallStack = this.promisedCallStack.then(function (callStackFirstPart) { return _this.getCallStackImpl(debugService, callStackFirstPart.length).then(function (callStackSecondPart) {
                    _this.cachedCallStack = callStackFirstPart.concat(callStackSecondPart);
                    return _this.cachedCallStack;
                }); });
            }
            return this.promisedCallStack;
        };
        Thread.prototype.getCallStackImpl = function (debugService, startFrame) {
            var _this = this;
            var session = debugService.getActiveSession();
            return session.stackTrace({ threadId: this.threadId, startFrame: startFrame, levels: 20 }).then(function (response) {
                _this.stoppedDetails.totalFrames = response.body.totalFrames || response.body.stackFrames.length;
                return response.body.stackFrames.map(function (rsf, level) {
                    if (!rsf) {
                        return new StackFrame(_this.threadId, 0, new debugSource_1.Source({ name: 'unknown' }, false), nls.localize(1, null), undefined, undefined);
                    }
                    return new StackFrame(_this.threadId, rsf.id, rsf.source ? new debugSource_1.Source(rsf.source) : new debugSource_1.Source({ name: 'unknown' }, false), rsf.name, rsf.line, rsf.column);
                });
            });
        };
        return Thread;
    }());
    exports.Thread = Thread;
    var OutputElement = (function () {
        function OutputElement(id) {
            if (id === void 0) { id = uuid.generateUuid(); }
            this.id = id;
            // noop
        }
        OutputElement.prototype.getId = function () {
            return this.id;
        };
        return OutputElement;
    }());
    exports.OutputElement = OutputElement;
    var ValueOutputElement = (function (_super) {
        __extends(ValueOutputElement, _super);
        function ValueOutputElement(value, severity, category, counter) {
            if (counter === void 0) { counter = 1; }
            _super.call(this);
            this.value = value;
            this.severity = severity;
            this.category = category;
            this.counter = counter;
        }
        return ValueOutputElement;
    }(OutputElement));
    exports.ValueOutputElement = ValueOutputElement;
    var KeyValueOutputElement = (function (_super) {
        __extends(KeyValueOutputElement, _super);
        function KeyValueOutputElement(key, valueObj, annotation) {
            _super.call(this);
            this.key = key;
            this.valueObj = valueObj;
            this.annotation = annotation;
            this._valueName = null;
        }
        Object.defineProperty(KeyValueOutputElement.prototype, "value", {
            get: function () {
                if (this._valueName === null) {
                    if (this.valueObj === null) {
                        this._valueName = 'null';
                    }
                    else if (Array.isArray(this.valueObj)) {
                        this._valueName = "Array[" + this.valueObj.length + "]";
                    }
                    else if (types.isObject(this.valueObj)) {
                        this._valueName = 'Object';
                    }
                    else if (types.isString(this.valueObj)) {
                        this._valueName = "\"" + massageValue(this.valueObj) + "\"";
                    }
                    else {
                        this._valueName = String(this.valueObj);
                    }
                    if (!this._valueName) {
                        this._valueName = '';
                    }
                }
                return this._valueName;
            },
            enumerable: true,
            configurable: true
        });
        KeyValueOutputElement.prototype.getChildren = function () {
            var _this = this;
            if (!this.children) {
                if (Array.isArray(this.valueObj)) {
                    this.children = this.valueObj.slice(0, KeyValueOutputElement.MAX_CHILDREN).map(function (v, index) { return new KeyValueOutputElement(String(index), v, null); });
                }
                else if (types.isObject(this.valueObj)) {
                    this.children = Object.getOwnPropertyNames(this.valueObj).slice(0, KeyValueOutputElement.MAX_CHILDREN).map(function (key) { return new KeyValueOutputElement(key, _this.valueObj[key], null); });
                }
                else {
                    this.children = [];
                }
            }
            return this.children;
        };
        KeyValueOutputElement.MAX_CHILDREN = 1000; // upper bound of children per value
        return KeyValueOutputElement;
    }(OutputElement));
    exports.KeyValueOutputElement = KeyValueOutputElement;
    var ExpressionContainer = (function () {
        function ExpressionContainer(reference, id, cacheChildren) {
            this.reference = reference;
            this.id = id;
            this.cacheChildren = cacheChildren;
            this.children = null;
        }
        ExpressionContainer.prototype.getChildren = function (debugService) {
            if (!this.cacheChildren) {
                return resolveChildren(debugService, this);
            }
            if (!this.children) {
                this.children = resolveChildren(debugService, this);
            }
            return this.children;
        };
        ExpressionContainer.prototype.getId = function () {
            return this.id;
        };
        ExpressionContainer.allValues = {};
        return ExpressionContainer;
    }());
    exports.ExpressionContainer = ExpressionContainer;
    var Expression = (function (_super) {
        __extends(Expression, _super);
        function Expression(name, cacheChildren, id) {
            if (id === void 0) { id = uuid.generateUuid(); }
            _super.call(this, 0, id, cacheChildren);
            this.name = name;
            this.value = Expression.DEFAULT_VALUE;
            this.available = false;
        }
        Object.defineProperty(Expression.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                this._value = massageValue(value);
                this.valueChanged = ExpressionContainer.allValues[this.getId()] &&
                    ExpressionContainer.allValues[this.getId()] !== Expression.DEFAULT_VALUE && ExpressionContainer.allValues[this.getId()] !== value;
                ExpressionContainer.allValues[this.getId()] = value;
            },
            enumerable: true,
            configurable: true
        });
        Expression.DEFAULT_VALUE = 'not available';
        return Expression;
    }(ExpressionContainer));
    exports.Expression = Expression;
    var Variable = (function (_super) {
        __extends(Variable, _super);
        function Variable(parent, reference, name, value, available) {
            if (available === void 0) { available = true; }
            _super.call(this, reference, "variable:" + parent.getId() + ":" + name, true);
            this.parent = parent;
            this.name = name;
            this.available = available;
            this.value = massageValue(value);
            this.valueChanged = ExpressionContainer.allValues[this.getId()] && ExpressionContainer.allValues[this.getId()] !== value;
            ExpressionContainer.allValues[this.getId()] = value;
        }
        return Variable;
    }(ExpressionContainer));
    exports.Variable = Variable;
    var Scope = (function () {
        function Scope(threadId, name, reference, expensive) {
            this.threadId = threadId;
            this.name = name;
            this.reference = reference;
            this.expensive = expensive;
            this.children = null;
        }
        Scope.prototype.getId = function () {
            return "scope:" + this.threadId + ":" + this.name + ":" + this.reference;
        };
        Scope.prototype.getChildren = function (debugService) {
            if (!this.children) {
                this.children = resolveChildren(debugService, this);
            }
            return this.children;
        };
        return Scope;
    }());
    exports.Scope = Scope;
    var StackFrame = (function () {
        function StackFrame(threadId, frameId, source, name, lineNumber, column) {
            this.threadId = threadId;
            this.frameId = frameId;
            this.source = source;
            this.name = name;
            this.lineNumber = lineNumber;
            this.column = column;
            this.internalId = uuid.generateUuid();
            this.scopes = null;
        }
        StackFrame.prototype.getId = function () {
            return this.internalId;
        };
        StackFrame.prototype.getScopes = function (debugService) {
            var _this = this;
            if (!this.scopes) {
                this.scopes = debugService.getActiveSession().scopes({ frameId: this.frameId }).then(function (response) {
                    return response.body.scopes.map(function (rs) { return new Scope(_this.threadId, rs.name, rs.variablesReference, rs.expensive); });
                }, function (err) { return []; });
            }
            return this.scopes;
        };
        return StackFrame;
    }());
    exports.StackFrame = StackFrame;
    var Breakpoint = (function () {
        function Breakpoint(source, desiredLineNumber, enabled, condition) {
            this.source = source;
            this.desiredLineNumber = desiredLineNumber;
            this.enabled = enabled;
            this.condition = condition;
            if (enabled === undefined) {
                this.enabled = true;
            }
            this.lineNumber = this.desiredLineNumber;
            this.verified = false;
            this.id = uuid.generateUuid();
        }
        Breakpoint.prototype.getId = function () {
            return this.id;
        };
        return Breakpoint;
    }());
    exports.Breakpoint = Breakpoint;
    var FunctionBreakpoint = (function () {
        function FunctionBreakpoint(name, enabled) {
            this.name = name;
            this.enabled = enabled;
            this.verified = false;
            this.id = uuid.generateUuid();
        }
        FunctionBreakpoint.prototype.getId = function () {
            return this.id;
        };
        return FunctionBreakpoint;
    }());
    exports.FunctionBreakpoint = FunctionBreakpoint;
    var ExceptionBreakpoint = (function () {
        function ExceptionBreakpoint(filter, label, enabled) {
            this.filter = filter;
            this.label = label;
            this.enabled = enabled;
            this.id = uuid.generateUuid();
        }
        ExceptionBreakpoint.prototype.getId = function () {
            return this.id;
        };
        return ExceptionBreakpoint;
    }());
    exports.ExceptionBreakpoint = ExceptionBreakpoint;
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(breakpoints, breakpointsActivated, functionBreakpoints, exceptionBreakpoints, watchExpressions) {
            _super.call(this);
            this.breakpoints = breakpoints;
            this.breakpointsActivated = breakpointsActivated;
            this.functionBreakpoints = functionBreakpoints;
            this.exceptionBreakpoints = exceptionBreakpoints;
            this.watchExpressions = watchExpressions;
            this.threads = {};
            this.replElements = [];
            this.toDispose = [];
        }
        Model.prototype.getId = function () {
            return 'root';
        };
        Model.prototype.getThreads = function () {
            return this.threads;
        };
        Model.prototype.clearThreads = function (removeThreads, reference) {
            if (reference === void 0) { reference = undefined; }
            if (reference) {
                if (removeThreads) {
                    delete this.threads[reference];
                }
                else {
                    this.threads[reference].clearCallStack();
                    this.threads[reference].stoppedDetails = undefined;
                }
            }
            else {
                if (removeThreads) {
                    this.threads = {};
                    ExpressionContainer.allValues = {};
                }
                else {
                    for (var ref in this.threads) {
                        if (this.threads.hasOwnProperty(ref)) {
                            this.threads[ref].clearCallStack();
                            this.threads[ref].stoppedDetails = undefined;
                        }
                    }
                }
            }
            this.emit(debug.ModelEvents.CALLSTACK_UPDATED);
        };
        Model.prototype.continueThreads = function () {
            for (var ref in this.threads) {
                if (this.threads.hasOwnProperty(ref)) {
                    this.threads[ref].stopped = false;
                }
            }
            this.clearThreads(false);
        };
        Model.prototype.getBreakpoints = function () {
            return this.breakpoints;
        };
        Model.prototype.getFunctionBreakpoints = function () {
            return this.functionBreakpoints;
        };
        Model.prototype.getExceptionBreakpoints = function () {
            return this.exceptionBreakpoints;
        };
        Model.prototype.setExceptionBreakpoints = function (data) {
            var _this = this;
            if (data) {
                this.exceptionBreakpoints = data.map(function (d) {
                    var ebp = _this.exceptionBreakpoints.filter(function (ebp) { return ebp.filter === d.filter; }).pop();
                    return new ExceptionBreakpoint(d.filter, d.label, ebp ? ebp.enabled : d.default);
                });
            }
        };
        Model.prototype.areBreakpointsActivated = function () {
            return this.breakpointsActivated;
        };
        Model.prototype.toggleBreakpointsActivated = function () {
            this.breakpointsActivated = !this.breakpointsActivated;
            this.emit(debug.ModelEvents.BREAKPOINTS_UPDATED);
        };
        Model.prototype.addBreakpoints = function (rawData) {
            var _this = this;
            this.breakpoints = this.breakpoints.concat(rawData.map(function (rawBp) {
                return new Breakpoint(new debugSource_1.Source(debugSource_1.Source.toRawSource(rawBp.uri, _this)), rawBp.lineNumber, rawBp.enabled, rawBp.condition);
            }));
            this.breakpointsActivated = true;
            this.emit(debug.ModelEvents.BREAKPOINTS_UPDATED);
        };
        Model.prototype.removeBreakpoints = function (toRemove) {
            this.breakpoints = this.breakpoints.filter(function (bp) { return !toRemove.some(function (toRemove) { return toRemove.getId() === bp.getId(); }); });
            this.emit(debug.ModelEvents.BREAKPOINTS_UPDATED);
        };
        Model.prototype.updateBreakpoints = function (data) {
            this.breakpoints.forEach(function (bp) {
                var bpData = data[bp.getId()];
                if (bpData) {
                    bp.lineNumber = bpData.line ? bpData.line : bp.lineNumber;
                    bp.verified = bpData.verified;
                    bp.idFromAdapter = bpData.id;
                    bp.message = bpData.message;
                }
            });
            this.emit(debug.ModelEvents.BREAKPOINTS_UPDATED);
        };
        Model.prototype.toggleEnablement = function (element) {
            element.enabled = !element.enabled;
            if (element instanceof Breakpoint && !element.enabled) {
                var breakpoint = element;
                breakpoint.lineNumber = breakpoint.desiredLineNumber;
                breakpoint.verified = false;
            }
            this.emit(debug.ModelEvents.BREAKPOINTS_UPDATED);
        };
        Model.prototype.enableOrDisableAllBreakpoints = function (enabled) {
            this.breakpoints.forEach(function (bp) {
                bp.enabled = enabled;
                if (!enabled) {
                    bp.lineNumber = bp.desiredLineNumber;
                    bp.verified = false;
                }
            });
            this.exceptionBreakpoints.forEach(function (ebp) { return ebp.enabled = enabled; });
            this.functionBreakpoints.forEach(function (fbp) { return fbp.enabled = enabled; });
            this.emit(debug.ModelEvents.BREAKPOINTS_UPDATED);
        };
        Model.prototype.addFunctionBreakpoint = function (functionName) {
            this.functionBreakpoints.push(new FunctionBreakpoint(functionName, true));
            this.emit(debug.ModelEvents.BREAKPOINTS_UPDATED);
        };
        Model.prototype.updateFunctionBreakpoints = function (data) {
            this.functionBreakpoints.forEach(function (fbp) {
                var fbpData = data[fbp.getId()];
                if (fbpData) {
                    fbp.name = fbpData.name || fbp.name;
                    fbp.verified = fbpData.verified;
                    fbp.idFromAdapter = fbpData.id;
                }
            });
            this.emit(debug.ModelEvents.BREAKPOINTS_UPDATED);
        };
        Model.prototype.removeFunctionBreakpoints = function (id) {
            this.functionBreakpoints = id ? this.functionBreakpoints.filter(function (fbp) { return fbp.getId() !== id; }) : [];
            this.emit(debug.ModelEvents.BREAKPOINTS_UPDATED);
        };
        Model.prototype.getReplElements = function () {
            return this.replElements;
        };
        Model.prototype.addReplExpression = function (session, stackFrame, name) {
            var _this = this;
            var expression = new Expression(name, true);
            this.addReplElements([expression]);
            return evaluateExpression(session, stackFrame, expression, 'repl').then(function () {
                return _this.emit(debug.ModelEvents.REPL_ELEMENTS_UPDATED, expression);
            });
        };
        Model.prototype.logToRepl = function (value, severity) {
            var elements = [];
            var previousOutput = this.replElements.length && this.replElements[this.replElements.length - 1];
            // string message
            if (typeof value === 'string') {
                if (value && value.trim() && previousOutput && previousOutput.value === value && previousOutput.severity === severity) {
                    previousOutput.counter++; // we got the same output (but not an empty string when trimmed) so we just increment the counter
                }
                else {
                    var lines = value.trim().split('\n');
                    lines.forEach(function (line, index) {
                        elements.push(new ValueOutputElement(line, severity));
                    });
                }
            }
            else {
                elements.push(new KeyValueOutputElement(value.prototype, value, nls.localize(2, null)));
            }
            if (elements.length) {
                this.addReplElements(elements);
                this.emit(debug.ModelEvents.REPL_ELEMENTS_UPDATED, elements);
            }
        };
        Model.prototype.appendReplOutput = function (value, severity) {
            var elements = [];
            var previousOutput = this.replElements.length && this.replElements[this.replElements.length - 1];
            var lines = value.split('\n');
            var groupTogether = !!previousOutput && (previousOutput.category === 'output' && severity === previousOutput.severity);
            if (groupTogether) {
                // append to previous line if same group
                previousOutput.value += lines.shift();
            }
            else if (previousOutput && previousOutput.value === '') {
                // remove potential empty lines between different output types
                this.replElements.pop();
            }
            // fill in lines as output value elements
            lines.forEach(function (line, index) {
                elements.push(new ValueOutputElement(line, severity, 'output'));
            });
            this.addReplElements(elements);
            this.emit(debug.ModelEvents.REPL_ELEMENTS_UPDATED, elements);
        };
        Model.prototype.addReplElements = function (newElements) {
            (_a = this.replElements).push.apply(_a, newElements);
            if (this.replElements.length > MAX_REPL_LENGTH) {
                this.replElements.splice(0, this.replElements.length - MAX_REPL_LENGTH);
            }
            var _a;
        };
        Model.prototype.clearReplExpressions = function () {
            if (this.replElements.length > 0) {
                this.replElements = [];
                this.emit(debug.ModelEvents.REPL_ELEMENTS_UPDATED);
            }
        };
        Model.prototype.getWatchExpressions = function () {
            return this.watchExpressions;
        };
        Model.prototype.addWatchExpression = function (session, stackFrame, name) {
            var we = new Expression(name, false);
            this.watchExpressions.push(we);
            if (!name) {
                this.emit(debug.ModelEvents.WATCH_EXPRESSIONS_UPDATED, we);
                return winjs_base_1.TPromise.as(null);
            }
            return this.evaluateWatchExpressions(session, stackFrame, we.getId());
        };
        Model.prototype.renameWatchExpression = function (session, stackFrame, id, newName) {
            var _this = this;
            var filtered = this.watchExpressions.filter(function (we) { return we.getId() === id; });
            if (filtered.length === 1) {
                filtered[0].name = newName;
                return evaluateExpression(session, stackFrame, filtered[0], 'watch').then(function () {
                    _this.emit(debug.ModelEvents.WATCH_EXPRESSIONS_UPDATED, filtered[0]);
                });
            }
            return winjs_base_1.TPromise.as(null);
        };
        Model.prototype.evaluateWatchExpressions = function (session, stackFrame, id) {
            var _this = this;
            if (id === void 0) { id = null; }
            if (id) {
                var filtered_1 = this.watchExpressions.filter(function (we) { return we.getId() === id; });
                if (filtered_1.length !== 1) {
                    return winjs_base_1.TPromise.as(null);
                }
                return evaluateExpression(session, stackFrame, filtered_1[0], 'watch').then(function () {
                    _this.emit(debug.ModelEvents.WATCH_EXPRESSIONS_UPDATED, filtered_1[0]);
                });
            }
            return winjs_base_1.TPromise.join(this.watchExpressions.map(function (we) { return evaluateExpression(session, stackFrame, we, 'watch'); })).then(function () {
                _this.emit(debug.ModelEvents.WATCH_EXPRESSIONS_UPDATED);
            });
        };
        Model.prototype.clearWatchExpressionValues = function () {
            this.watchExpressions.forEach(function (we) {
                we.value = Expression.DEFAULT_VALUE;
                we.available = false;
                we.reference = 0;
            });
            this.emit(debug.ModelEvents.WATCH_EXPRESSIONS_UPDATED);
        };
        Model.prototype.clearWatchExpressions = function (id) {
            if (id === void 0) { id = null; }
            this.watchExpressions = id ? this.watchExpressions.filter(function (we) { return we.getId() !== id; }) : [];
            this.emit(debug.ModelEvents.WATCH_EXPRESSIONS_UPDATED);
        };
        Model.prototype.sourceIsUnavailable = function (source) {
            var _this = this;
            Object.keys(this.threads).forEach(function (key) {
                if (_this.threads[key].getCachedCallStack()) {
                    _this.threads[key].getCachedCallStack().forEach(function (stackFrame) {
                        if (stackFrame.source.uri.toString() === source.uri.toString()) {
                            stackFrame.source.available = false;
                        }
                    });
                }
            });
            this.emit(debug.ModelEvents.CALLSTACK_UPDATED);
        };
        Model.prototype.rawUpdate = function (data) {
            if (data.thread) {
                this.threads[data.threadId] = new Thread(data.thread.name, data.thread.id);
            }
            if (data.stoppedDetails) {
                // Set the availability of the threads' callstacks depending on
                // whether the thread is stopped or not
                for (var ref in this.threads) {
                    if (this.threads.hasOwnProperty(ref)) {
                        if (data.allThreadsStopped) {
                            // Only update the details if all the threads are stopped
                            // because we don't want to overwrite the details of other
                            // threads that have stopped for a different reason
                            this.threads[ref].stoppedDetails = data.stoppedDetails;
                        }
                        this.threads[ref].stopped = data.allThreadsStopped;
                        this.threads[ref].clearCallStack();
                    }
                }
                this.threads[data.threadId].stoppedDetails = data.stoppedDetails;
                this.threads[data.threadId].stopped = true;
            }
            this.emit(debug.ModelEvents.CALLSTACK_UPDATED);
        };
        Model.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.threads = null;
            this.breakpoints = null;
            this.exceptionBreakpoints = null;
            this.functionBreakpoints = null;
            this.watchExpressions = null;
            this.replElements = null;
            this.toDispose = lifecycle.dispose(this.toDispose);
        };
        return Model;
    }(ee.EventEmitter));
    exports.Model = Model;
});
//# sourceMappingURL=debugModel.js.map