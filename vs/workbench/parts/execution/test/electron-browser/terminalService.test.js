/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'assert', 'vs/workbench/parts/execution/electron-browser/terminalService', 'vs/workbench/parts/execution/electron-browser/terminal'], function (require, exports, assert_1, terminalService_1, terminal_1) {
    'use strict';
    suite('Execution - TerminalService', function () {
        var mockOnExit;
        var mockOnError;
        var mockConfig;
        setup(function () {
            mockConfig = {
                externalTerminal: {
                    windowsExec: 'testWindowsShell',
                    linuxExec: 'testLinuxShell'
                }
            };
            mockOnExit = function (s) { return s; };
            mockOnError = function (e) { return e; };
        });
        test("WinTerminalService - uses terminal from configuration", function (done) {
            var testShell = 'cmd';
            var testCwd = 'path/to/workspace';
            var mockSpawner = {
                spawn: function (command, args, opts) {
                    // assert
                    assert_1.equal(command, testShell, 'shell should equal expected');
                    assert_1.equal(args[args.length - 1], mockConfig.externalTerminal.windowsExec, 'terminal should equal expected');
                    assert_1.equal(opts.cwd, testCwd, 'opts.cwd should equal expected');
                    done();
                    return {
                        on: function (evt) { return evt; }
                    };
                }
            };
            var testService = new terminalService_1.WinTerminalService(mockConfig);
            testService.spawnTerminal(mockSpawner, mockConfig, testShell, testCwd, mockOnExit, mockOnError);
        });
        test("WinTerminalService - uses default terminal when configuration.terminal.external.windowsExec is undefined", function (done) {
            var testShell = 'cmd';
            var testCwd = 'path/to/workspace';
            var mockSpawner = {
                spawn: function (command, args, opts) {
                    // assert
                    assert_1.equal(args[args.length - 1], terminal_1.DEFAULT_TERMINAL_WINDOWS, 'terminal should equal expected');
                    done();
                    return {
                        on: function (evt) { return evt; }
                    };
                }
            };
            mockConfig.externalTerminal.windowsExec = undefined;
            var testService = new terminalService_1.WinTerminalService(mockConfig);
            testService.spawnTerminal(mockSpawner, mockConfig, testShell, testCwd, mockOnExit, mockOnError);
        });
        test("LinuxTerminalService - uses terminal from configuration", function (done) {
            var testCwd = 'path/to/workspace';
            var mockSpawner = {
                spawn: function (command, args, opts) {
                    // assert
                    assert_1.equal(command, mockConfig.externalTerminal.linuxExec, 'terminal should equal expected');
                    assert_1.equal(opts.cwd, testCwd, 'opts.cwd should equal expected');
                    done();
                    return {
                        on: function (evt) { return evt; }
                    };
                }
            };
            var testService = new terminalService_1.LinuxTerminalService(mockConfig);
            testService.spawnTerminal(mockSpawner, mockConfig, testCwd, mockOnExit, mockOnError);
        });
        test("LinuxTerminalService - uses default terminal when configuration.terminal.external.linuxExec is undefined", function (done) {
            var testCwd = 'path/to/workspace';
            var mockSpawner = {
                spawn: function (command, args, opts) {
                    // assert
                    assert_1.equal(command, terminal_1.DEFAULT_TERMINAL_LINUX, 'terminal should equal expected');
                    done();
                    return {
                        on: function (evt) { return evt; }
                    };
                }
            };
            mockConfig.externalTerminal.linuxExec = undefined;
            var testService = new terminalService_1.LinuxTerminalService(mockConfig);
            testService.spawnTerminal(mockSpawner, mockConfig, testCwd, mockOnExit, mockOnError);
        });
    });
});
//# sourceMappingURL=terminalService.test.js.map