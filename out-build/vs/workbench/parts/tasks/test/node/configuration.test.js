define(["require", "exports", 'assert', 'vs/base/common/severity', 'vs/base/common/platform', 'vs/platform/markers/common/problemMatcher', 'vs/workbench/parts/tasks/common/taskSystem', 'vs/workbench/parts/tasks/node/processRunnerConfiguration'], function (require, exports, assert, severity_1, Platform, problemMatcher_1, TaskSystem, processRunnerConfiguration_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var Logger = (function () {
        function Logger() {
            this.receivedMessage = false;
            this.lastMessage = null;
        }
        Logger.prototype.log = function (message) {
            this.receivedMessage = true;
            this.lastMessage = message;
        };
        return Logger;
    }());
    var ConfiguationBuilder = (function () {
        function ConfiguationBuilder(command) {
            this.result = {
                command: command,
                isShellCommand: false,
                args: [],
                options: {
                    cwd: '${workspaceRoot}'
                },
                tasks: Object.create(null)
            };
        }
        ConfiguationBuilder.prototype.shell = function (value) {
            this.result.isShellCommand = value;
            return this;
        };
        ConfiguationBuilder.prototype.args = function (value) {
            this.result.args = value;
            return this;
        };
        ConfiguationBuilder.prototype.options = function (value) {
            this.result.options = value;
            return this;
        };
        ConfiguationBuilder.prototype.task = function (name) {
            var builder = new TaskBuilder(this, name);
            this.result.tasks[builder.result.name] = builder.result;
            return builder;
        };
        return ConfiguationBuilder;
    }());
    var TaskBuilder = (function () {
        function TaskBuilder(parent, name) {
            this.parent = parent;
            this.result = {
                id: name,
                name: name,
                showOutput: TaskSystem.ShowOutput.Always,
                suppressTaskName: false,
                echoCommand: false,
                isWatching: false,
                promptOnClose: true,
                problemMatchers: []
            };
        }
        TaskBuilder.prototype.args = function (value) {
            this.result.args = value;
            return this;
        };
        TaskBuilder.prototype.showOutput = function (value) {
            this.result.showOutput = value;
            return this;
        };
        TaskBuilder.prototype.suppressTaskName = function (value) {
            this.result.suppressTaskName = value;
            return this;
        };
        TaskBuilder.prototype.echoCommand = function (value) {
            this.result.echoCommand = value;
            return this;
        };
        TaskBuilder.prototype.isWatching = function (value) {
            this.result.isWatching = value;
            return this;
        };
        TaskBuilder.prototype.promptOnClose = function (value) {
            this.result.promptOnClose = value;
            return this;
        };
        TaskBuilder.prototype.problemMatcher = function () {
            var builder = new ProblemMatcherBuilder(this);
            this.result.problemMatchers.push(builder.result);
            return builder;
        };
        return TaskBuilder;
    }());
    var ProblemMatcherBuilder = (function () {
        function ProblemMatcherBuilder(parent) {
            this.parent = parent;
            this.result = {
                owner: 'external',
                applyTo: problemMatcher_1.ApplyToKind.allDocuments,
                severity: undefined,
                fileLocation: problemMatcher_1.FileLocationKind.Relative,
                filePrefix: '${cwd}',
                pattern: undefined
            };
        }
        ProblemMatcherBuilder.prototype.owner = function (value) {
            this.result.owner = value;
            return this;
        };
        ProblemMatcherBuilder.prototype.applyTo = function (value) {
            this.result.applyTo = value;
            return this;
        };
        ProblemMatcherBuilder.prototype.severity = function (value) {
            this.result.severity = value;
            return this;
        };
        ProblemMatcherBuilder.prototype.fileLocation = function (value) {
            this.result.fileLocation = value;
            return this;
        };
        ProblemMatcherBuilder.prototype.filePrefix = function (value) {
            this.result.filePrefix = value;
            return this;
        };
        ProblemMatcherBuilder.prototype.pattern = function (regExp) {
            var builder = new PatternBuilder(this, regExp);
            if (!this.result.pattern) {
                this.result.pattern = builder.result;
            }
            return builder;
        };
        return ProblemMatcherBuilder;
    }());
    var PatternBuilder = (function () {
        function PatternBuilder(parent, regExp) {
            this.parent = parent;
            this.result = {
                regexp: regExp,
                file: 1,
                message: 4,
                line: 2,
                column: 3
            };
        }
        PatternBuilder.prototype.file = function (value) {
            this.result.file = value;
            return this;
        };
        PatternBuilder.prototype.message = function (value) {
            this.result.message = value;
            return this;
        };
        PatternBuilder.prototype.location = function (value) {
            this.result.location = value;
            return this;
        };
        PatternBuilder.prototype.line = function (value) {
            this.result.line = value;
            return this;
        };
        PatternBuilder.prototype.column = function (value) {
            this.result.column = value;
            return this;
        };
        PatternBuilder.prototype.endLine = function (value) {
            this.result.endLine = value;
            return this;
        };
        PatternBuilder.prototype.endColumn = function (value) {
            this.result.endColumn = value;
            return this;
        };
        PatternBuilder.prototype.code = function (value) {
            this.result.code = value;
            return this;
        };
        PatternBuilder.prototype.severity = function (value) {
            this.result.severity = value;
            return this;
        };
        PatternBuilder.prototype.loop = function (value) {
            this.result.loop = value;
            return this;
        };
        PatternBuilder.prototype.mostSignifikant = function (value) {
            this.result.mostSignifikant = value;
            return this;
        };
        return PatternBuilder;
    }());
    suite('Tasks Configuration parsing tests', function () {
        test('tasks: all default', function () {
            var builder = new ConfiguationBuilder('tsc');
            builder.task('tsc').
                suppressTaskName(true);
            testGobalCommand({
                version: '0.1.0',
                command: "tsc"
            }, builder);
        });
        test('tasks: global isShellCommand', function () {
            var builder = new ConfiguationBuilder('tsc');
            builder.shell(true).
                task('tsc').
                suppressTaskName(true);
            testGobalCommand({
                version: '0.1.0',
                command: "tsc",
                isShellCommand: true
            }, builder);
        });
        test('tasks: global show output silent', function () {
            var builder = new ConfiguationBuilder('tsc');
            builder.
                task('tsc').
                suppressTaskName(true).
                showOutput(TaskSystem.ShowOutput.Silent);
            testGobalCommand({
                version: '0.1.0',
                command: "tsc",
                showOutput: 'silent'
            }, builder);
        });
        test('tasks: global promptOnClose default', function () {
            var builder = new ConfiguationBuilder('tsc');
            builder.task('tsc').
                suppressTaskName(true);
            testGobalCommand({
                version: '0.1.0',
                command: "tsc",
                promptOnClose: true
            }, builder);
        });
        test('tasks: global promptOnClose', function () {
            var builder = new ConfiguationBuilder('tsc');
            builder.task('tsc').
                suppressTaskName(true).
                promptOnClose(false);
            testGobalCommand({
                version: '0.1.0',
                command: "tsc",
                promptOnClose: false
            }, builder);
        });
        test('tasks: global promptOnClose default watching', function () {
            var builder = new ConfiguationBuilder('tsc');
            builder.task('tsc').
                suppressTaskName(true).
                isWatching(true).
                promptOnClose(false);
            testGobalCommand({
                version: '0.1.0',
                command: "tsc",
                isWatching: true
            }, builder);
        });
        test('tasks: global show output never', function () {
            var builder = new ConfiguationBuilder('tsc');
            builder.
                task('tsc').
                suppressTaskName(true).
                showOutput(TaskSystem.ShowOutput.Never);
            testGobalCommand({
                version: '0.1.0',
                command: "tsc",
                showOutput: 'never'
            }, builder);
        });
        test('tasks: global echo Command', function () {
            var builder = new ConfiguationBuilder('tsc');
            builder.
                task('tsc').
                suppressTaskName(true).
                echoCommand(true);
            testGobalCommand({
                version: '0.1.0',
                command: "tsc",
                echoCommand: true
            }, builder);
        });
        test('tasks: global args', function () {
            var builder = new ConfiguationBuilder('tsc');
            builder.
                args(['--p']).
                task('tsc').
                suppressTaskName(true);
            testGobalCommand({
                version: '0.1.0',
                command: "tsc",
                args: [
                    '--p'
                ]
            }, builder);
        });
        test('tasks: options - cwd', function () {
            var builder = new ConfiguationBuilder('tsc');
            builder.
                options({
                cwd: "myPath"
            }).
                task('tsc').
                suppressTaskName(true);
            testGobalCommand({
                version: '0.1.0',
                command: "tsc",
                options: {
                    cwd: "myPath"
                }
            }, builder);
        });
        test('tasks: options - env', function () {
            var builder = new ConfiguationBuilder('tsc');
            builder.
                options({ cwd: '${workspaceRoot}', env: { key: 'value' } }).
                task('tsc').
                suppressTaskName(true);
            testGobalCommand({
                version: '0.1.0',
                command: "tsc",
                options: {
                    env: {
                        key: 'value'
                    }
                }
            }, builder);
        });
        test('tasks: os windows', function () {
            var name = Platform.isWindows ? 'tsc.win' : 'tsc';
            var builder = new ConfiguationBuilder(name);
            builder.
                task(name).
                suppressTaskName(true);
            var external = {
                version: '0.1.0',
                command: 'tsc',
                windows: {
                    command: 'tsc.win'
                }
            };
            testGobalCommand(external, builder);
        });
        test('tasks: os windows & global isShellCommand', function () {
            var name = Platform.isWindows ? 'tsc.win' : 'tsc';
            var builder = new ConfiguationBuilder(name);
            builder.
                shell(true).
                task(name).
                suppressTaskName(true);
            var external = {
                version: '0.1.0',
                command: 'tsc',
                isShellCommand: true,
                windows: {
                    command: 'tsc.win'
                }
            };
            testGobalCommand(external, builder);
        });
        test('tasks: os mac', function () {
            var name = Platform.isMacintosh ? 'tsc.osx' : 'tsc';
            var builder = new ConfiguationBuilder(name);
            builder.
                task(name).
                suppressTaskName(true);
            var external = {
                version: '0.1.0',
                command: 'tsc',
                osx: {
                    command: 'tsc.osx'
                }
            };
            testGobalCommand(external, builder);
        });
        test('tasks: os linux', function () {
            var name = Platform.isLinux ? 'tsc.linux' : 'tsc';
            var builder = new ConfiguationBuilder(name);
            builder.
                task(name).
                suppressTaskName(true);
            var external = {
                version: '0.1.0',
                command: 'tsc',
                linux: {
                    command: 'tsc.linux'
                }
            };
            testGobalCommand(external, builder);
        });
        test('tasks: overwrite showOutput', function () {
            var builder = new ConfiguationBuilder('tsc');
            builder.
                task('tsc').
                showOutput(Platform.isWindows ? TaskSystem.ShowOutput.Always : TaskSystem.ShowOutput.Never).
                suppressTaskName(true);
            var external = {
                version: '0.1.0',
                command: 'tsc',
                showOutput: 'never',
                windows: {
                    showOutput: 'always'
                }
            };
            testGobalCommand(external, builder);
        });
        test('tasks: overwrite echo Command', function () {
            var builder = new ConfiguationBuilder('tsc');
            builder.
                task('tsc').
                echoCommand(Platform.isWindows ? false : true).
                suppressTaskName(true);
            var external = {
                version: '0.1.0',
                command: 'tsc',
                echoCommand: true,
                windows: {
                    echoCommand: false
                }
            };
            testGobalCommand(external, builder);
        });
        test('tasks: global problemMatcher one', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                problemMatcher: '$tsc'
            };
            testDefaultProblemMatcher(external, 1);
        });
        test('tasks: global problemMatcher two', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                problemMatcher: ['$tsc', '$msCompile']
            };
            testDefaultProblemMatcher(external, 2);
        });
        test('tasks: task definition', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName'
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('taskName');
            testConfiguration(external, builder);
        });
        test('tasks: build task', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        isBuildCommand: true
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('taskName');
            var result = testConfiguration(external, builder);
            assert.ok(result.defaultBuildTaskIdentifier);
        });
        test('tasks: default build task', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'build'
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('build');
            var result = testConfiguration(external, builder);
            assert.ok(result.defaultBuildTaskIdentifier);
        });
        test('tasks: test task', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        isTestCommand: true
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('taskName');
            var result = testConfiguration(external, builder);
            assert.ok(result.defaultTestTaskIdentifier);
        });
        test('tasks: default test task', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'test'
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('test');
            var result = testConfiguration(external, builder);
            assert.ok(result.defaultTestTaskIdentifier);
        });
        test('tasks: task with values', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'test',
                        showOutput: 'never',
                        echoCommand: true,
                        args: ['--p'],
                        isWatching: true
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('test').
                showOutput(TaskSystem.ShowOutput.Never).
                echoCommand(true).
                args(['--p']).
                isWatching(true).
                promptOnClose(false);
            var result = testConfiguration(external, builder);
            assert.ok(result.defaultTestTaskIdentifier);
        });
        test('tasks: task inherits global values', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                showOutput: 'never',
                echoCommand: true,
                tasks: [
                    {
                        taskName: 'test'
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('test').
                showOutput(TaskSystem.ShowOutput.Never).
                echoCommand(true);
            var result = testConfiguration(external, builder);
            assert.ok(result.defaultTestTaskIdentifier);
        });
        test('tasks: problem matcher default', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            pattern: {
                                regexp: 'abc'
                            }
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('taskName').problemMatcher().pattern(/abc/);
            testConfiguration(external, builder);
        });
        test('tasks: problem matcher .* regular expression', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            pattern: {
                                regexp: '.*'
                            }
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('taskName').problemMatcher().pattern(/.*/);
            testConfiguration(external, builder);
        });
        test('tasks: problem matcher owner, applyTo, severity and fileLocation', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            owner: 'myOwner',
                            applyTo: 'closedDocuments',
                            severity: 'warning',
                            fileLocation: 'absolute',
                            pattern: {
                                regexp: 'abc'
                            }
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('taskName').problemMatcher().
                owner('myOwner').
                applyTo(problemMatcher_1.ApplyToKind.closedDocuments).
                severity(severity_1.default.Warning).
                fileLocation(problemMatcher_1.FileLocationKind.Absolute).
                filePrefix(undefined).
                pattern(/abc/);
            testConfiguration(external, builder);
        });
        test('tasks: problem matcher fileLocation and filePrefix', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            fileLocation: ['relative', 'myPath'],
                            pattern: {
                                regexp: 'abc'
                            }
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('taskName').problemMatcher().
                fileLocation(problemMatcher_1.FileLocationKind.Relative).
                filePrefix('myPath').
                pattern(/abc/);
            testConfiguration(external, builder);
        });
        test('tasks: problem pattern location', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            pattern: {
                                regexp: 'abc',
                                file: 10,
                                message: 11,
                                location: 12,
                                severity: 13,
                                code: 14
                            }
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('taskName').problemMatcher().
                pattern(/abc/).file(10).message(11).location(12).severity(13).code(14);
            testConfiguration(external, builder);
        });
        test('tasks: problem pattern line & column', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            pattern: {
                                regexp: 'abc',
                                file: 10,
                                message: 11,
                                line: 12,
                                column: 13,
                                endLine: 14,
                                endColumn: 15,
                                severity: 16,
                                code: 17
                            }
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('taskName').problemMatcher().
                pattern(/abc/).file(10).message(11).
                line(12).column(13).endLine(14).endColumn(15).
                severity(16).code(17);
            testConfiguration(external, builder);
        });
        test('tasks: prompt on close default', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName'
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('taskName').promptOnClose(true);
            testConfiguration(external, builder);
        });
        test('tasks: prompt on close watching', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        isWatching: true
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('taskName').isWatching(true).promptOnClose(false);
            testConfiguration(external, builder);
        });
        test('tasks: prompt on close set', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        promptOnClose: false
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('taskName').promptOnClose(false);
            testConfiguration(external, builder);
        });
        test('tasks: two tasks', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskNameOne'
                    },
                    {
                        taskName: 'taskNameTwo'
                    }
                ]
            };
            var builder = new ConfiguationBuilder('tsc');
            builder.task('taskNameOne');
            builder.task('taskNameTwo');
            testConfiguration(external, builder);
        });
        function testDefaultProblemMatcher(external, resolved) {
            var logger = new Logger();
            var result = processRunnerConfiguration_1.parse(external, logger);
            assert.ok(!logger.receivedMessage);
            var config = result.configuration;
            var keys = Object.keys(config.tasks);
            assert.strictEqual(keys.length, 1);
            var task = config.tasks[keys[0]];
            assert.ok(task);
            assert.strictEqual(task.problemMatchers.length, resolved);
        }
        function testGobalCommand(external, builder) {
            var result = testConfiguration(external, builder);
            assert.ok(result.defaultBuildTaskIdentifier);
            assert.ok(!result.defaultTestTaskIdentifier);
        }
        function testConfiguration(external, builder) {
            var logger = new Logger();
            var result = processRunnerConfiguration_1.parse(external, logger);
            if (logger.receivedMessage) {
                assert.ok(false, logger.lastMessage);
            }
            assertConfiguration(result, builder.result);
            return result;
        }
        function assertConfiguration(result, expected) {
            assert.ok(result.validationStatus.isOK());
            var actual = result.configuration;
            assert.strictEqual(actual.command, expected.command);
            assert.strictEqual(actual.isShellCommand, expected.isShellCommand);
            assert.deepEqual(actual.args, expected.args);
            assert.strictEqual(typeof actual.options, typeof expected.options);
            if (actual.options && expected.options) {
                assert.strictEqual(actual.options.cwd, expected.options.cwd);
                assert.strictEqual(typeof actual.options.env, typeof expected.options.env);
                if (actual.options.env && expected.options.env) {
                    assert.deepEqual(actual.options.env, expected.options.env);
                }
            }
            assert.strictEqual(typeof actual.tasks, typeof expected.tasks);
            if (actual.tasks && expected.tasks) {
                // We can't compare Ids since the parser uses UUID which are random
                // So create a new map using the name.
                var actualTasks_1 = Object.create(null);
                Object.keys(actual.tasks).forEach(function (key) {
                    var task = actual.tasks[key];
                    assert.ok(!actualTasks_1[task.name]);
                    actualTasks_1[task.name] = task;
                });
                var actualKeys = Object.keys(actualTasks_1);
                var expectedKeys = Object.keys(expected.tasks);
                assert.strictEqual(actualKeys.length, expectedKeys.length);
                actualKeys.forEach(function (key) {
                    var actualTask = actualTasks_1[key];
                    var expectedTask = expected.tasks[key];
                    assert.ok(expectedTask);
                    assertTask(actualTask, expectedTask);
                });
            }
        }
        function assertTask(actual, expected) {
            assert.ok(actual.id);
            assert.strictEqual(actual.name, expected.name, 'name');
            assert.strictEqual(actual.showOutput, expected.showOutput, 'showOutput');
            assert.strictEqual(actual.suppressTaskName, expected.suppressTaskName, 'suppressTaskName');
            assert.strictEqual(actual.echoCommand, expected.echoCommand, 'echoCommand');
            assert.strictEqual(actual.isWatching, expected.isWatching, 'isWatching');
            assert.strictEqual(actual.promptOnClose, expected.promptOnClose, 'promptOnClose');
            assert.strictEqual(typeof actual.problemMatchers, typeof expected.problemMatchers);
            if (actual.problemMatchers && expected.problemMatchers) {
                assert.strictEqual(actual.problemMatchers.length, expected.problemMatchers.length);
                for (var i = 0; i < actual.problemMatchers.length; i++) {
                    assertProblemMatcher(actual.problemMatchers[i], expected.problemMatchers[i]);
                }
            }
        }
        function assertProblemMatcher(actual, expected) {
            assert.strictEqual(actual.owner, expected.owner);
            assert.strictEqual(actual.applyTo, expected.applyTo);
            assert.strictEqual(actual.severity, expected.severity);
            assert.strictEqual(actual.fileLocation, expected.fileLocation);
            assert.strictEqual(actual.filePrefix, expected.filePrefix);
            if (actual.pattern && expected.pattern) {
                assertProblemPatterns(actual.pattern, expected.pattern);
            }
        }
        function assertProblemPatterns(actual, expected) {
            assert.strictEqual(typeof actual, typeof expected);
            if (Array.isArray(actual)) {
                var actuals = actual;
                var expecteds = expected;
                assert.strictEqual(actuals.length, expecteds.length);
                for (var i = 0; i < actuals.length; i++) {
                    assertProblemPattern(actuals[i], expecteds[i]);
                }
            }
            else {
                assertProblemPattern(actual, expected);
            }
        }
        function assertProblemPattern(actual, expected) {
            assert.equal(actual.regexp.toString(), expected.regexp.toString());
            assert.strictEqual(actual.file, expected.file);
            assert.strictEqual(actual.message, expected.message);
            if (typeof expected.location !== 'undefined') {
                assert.strictEqual(actual.location, expected.location);
            }
            else {
                assert.strictEqual(actual.line, expected.line);
                assert.strictEqual(actual.column, expected.column);
                assert.strictEqual(actual.endLine, expected.endLine);
                assert.strictEqual(actual.endColumn, expected.endColumn);
            }
            assert.strictEqual(actual.code, expected.code);
            assert.strictEqual(actual.severity, expected.severity);
            assert.strictEqual(actual.loop, expected.loop);
            assert.strictEqual(actual.mostSignifikant, expected.mostSignifikant);
        }
    });
});
//# sourceMappingURL=configuration.test.js.map