var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", 'vs/nls!vs/workbench/parts/git/browser/gitQuickOpen', 'vs/base/common/filters', 'vs/base/common/winjs.base', 'vs/base/common/severity', 'vs/workbench/parts/git/common/git', 'vs/workbench/browser/quickopen', 'vs/base/parts/quickopen/common/quickOpen', 'vs/base/parts/quickopen/browser/quickOpenModel', 'vs/workbench/services/quickopen/common/quickOpenService', 'vs/platform/message/common/message'], function (require, exports, nls, filters, winjs, severity_1, git, quickopenwb, quickopen, model, quickOpenService_1, message_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var IGitService = git.IGitService;
    // Entries
    var AbstractRefEntry = (function (_super) {
        __extends(AbstractRefEntry, _super);
        function AbstractRefEntry(gitService, messageService, head, highlights) {
            _super.call(this, highlights);
            this.gitService = gitService;
            this.messageService = messageService;
            this.head = head;
        }
        AbstractRefEntry.prototype.getIcon = function () { return 'git'; };
        AbstractRefEntry.prototype.getLabel = function () { return this.head.name; };
        AbstractRefEntry.prototype.getDescription = function () { return ''; };
        AbstractRefEntry.prototype.getAriaLabel = function () { return nls.localize(0, null, this.getLabel()); };
        AbstractRefEntry.prototype.run = function (mode, context) {
            if (mode === quickopen.Mode.PREVIEW) {
                return false;
            }
            return true;
        };
        return AbstractRefEntry;
    }(model.QuickOpenEntry));
    var CheckoutHeadEntry = (function (_super) {
        __extends(CheckoutHeadEntry, _super);
        function CheckoutHeadEntry() {
            _super.apply(this, arguments);
        }
        CheckoutHeadEntry.prototype.getDescription = function () { return nls.localize(1, null, this.head.commit.substr(0, 8)); };
        CheckoutHeadEntry.prototype.run = function (mode, context) {
            var _this = this;
            if (mode === quickopen.Mode.PREVIEW) {
                return false;
            }
            this.gitService.checkout(this.head.name).done(null, function (e) { return _this.messageService.show(severity_1.default.Error, e); });
            return true;
        };
        return CheckoutHeadEntry;
    }(AbstractRefEntry));
    var CheckoutTagEntry = (function (_super) {
        __extends(CheckoutTagEntry, _super);
        function CheckoutTagEntry() {
            _super.apply(this, arguments);
        }
        CheckoutTagEntry.prototype.getDescription = function () { return nls.localize(2, null, this.head.commit.substr(0, 8)); };
        CheckoutTagEntry.prototype.run = function (mode, context) {
            var _this = this;
            if (mode === quickopen.Mode.PREVIEW) {
                return false;
            }
            this.gitService.checkout(this.head.name).done(null, function (e) { return _this.messageService.show(severity_1.default.Error, e); });
            return true;
        };
        return CheckoutTagEntry;
    }(AbstractRefEntry));
    var CurrentHeadEntry = (function (_super) {
        __extends(CurrentHeadEntry, _super);
        function CurrentHeadEntry() {
            _super.apply(this, arguments);
        }
        CurrentHeadEntry.prototype.getDescription = function () { return nls.localize(3, null, this.head.name); };
        return CurrentHeadEntry;
    }(AbstractRefEntry));
    var BranchEntry = (function (_super) {
        __extends(BranchEntry, _super);
        function BranchEntry(gitService, messageService, name) {
            _super.call(this, [{ start: 0, end: name.length }]);
            this.gitService = gitService;
            this.messageService = messageService;
            this.name = name;
        }
        BranchEntry.prototype.getIcon = function () { return 'git'; };
        BranchEntry.prototype.getLabel = function () { return this.name; };
        BranchEntry.prototype.getAriaLabel = function () { return nls.localize(4, null, this.getLabel()); };
        BranchEntry.prototype.getDescription = function () { return nls.localize(5, null, this.name); };
        BranchEntry.prototype.run = function (mode, context) {
            var _this = this;
            if (mode === quickopen.Mode.PREVIEW) {
                return false;
            }
            this.gitService.branch(this.name, true).done(null, function (e) { return _this.messageService.show(severity_1.default.Error, e); });
            return true;
        };
        return BranchEntry;
    }(model.QuickOpenEntry));
    // Commands
    var CheckoutCommand = (function () {
        function CheckoutCommand(gitService, messageService) {
            this.gitService = gitService;
            this.messageService = messageService;
            this.aliases = ['checkout', 'co'];
            this.icon = 'git';
            // noop
        }
        CheckoutCommand.prototype.getResults = function (input) {
            var _this = this;
            input = input.trim();
            var gitModel = this.gitService.getModel();
            var currentHead = gitModel.getHEAD();
            var headMatches = gitModel.getHeads()
                .map(function (head) { return ({ head: head, highlights: filters.matchesContiguousSubString(input, head.name) }); })
                .filter(function (_a) {
                var highlights = _a.highlights;
                return !!highlights;
            });
            var headEntries = headMatches
                .filter(function (_a) {
                var head = _a.head;
                return head.name !== currentHead.name;
            })
                .map(function (_a) {
                var head = _a.head, highlights = _a.highlights;
                return new CheckoutHeadEntry(_this.gitService, _this.messageService, head, highlights);
            });
            var tagMatches = gitModel.getTags()
                .map(function (tag) { return ({ tag: tag, highlights: filters.matchesContiguousSubString(input, tag.name) }); })
                .filter(function (_a) {
                var highlights = _a.highlights;
                return !!highlights;
            });
            var tagEntries = tagMatches
                .filter(function (_a) {
                var tag = _a.tag;
                return tag.name !== currentHead.name;
            })
                .map(function (_a) {
                var tag = _a.tag, highlights = _a.highlights;
                return new CheckoutTagEntry(_this.gitService, _this.messageService, tag, highlights);
            });
            var entries = headEntries
                .concat(tagEntries)
                .sort(function (a, b) { return a.getLabel().localeCompare(b.getLabel()); });
            if (entries.length > 0) {
                entries[0] = new model.QuickOpenEntryGroup(entries[0], 'checkout', false);
            }
            var exactMatches = headMatches.filter(function (_a) {
                var head = _a.head;
                return head.name === input;
            });
            var currentHeadMatches = exactMatches.filter(function (_a) {
                var head = _a.head;
                return head.name === currentHead.name;
            });
            if (currentHeadMatches.length > 0) {
                entries.unshift(new CurrentHeadEntry(this.gitService, this.messageService, currentHeadMatches[0].head, currentHeadMatches[0].highlights));
            }
            else if (exactMatches.length === 0 && git.isValidBranchName(input)) {
                var branchEntry = new BranchEntry(this.gitService, this.messageService, input);
                entries.push(new model.QuickOpenEntryGroup(branchEntry, 'branch', false));
            }
            return winjs.TPromise.as(entries);
        };
        CheckoutCommand.prototype.getEmptyLabel = function (input) {
            return nls.localize(6, null);
        };
        return CheckoutCommand;
    }());
    var BranchCommand = (function () {
        function BranchCommand(gitService, messageService) {
            this.gitService = gitService;
            this.messageService = messageService;
            this.aliases = ['branch'];
            this.icon = 'git';
            // noop
        }
        BranchCommand.prototype.getResults = function (input) {
            input = input.trim();
            if (!git.isValidBranchName(input)) {
                return winjs.TPromise.as([]);
            }
            var gitModel = this.gitService.getModel();
            var currentHead = gitModel.getHEAD();
            var matches = gitModel.getHeads()
                .map(function (head) { return ({ head: head, highlights: filters.matchesContiguousSubString(input, head.name) }); })
                .filter(function (_a) {
                var highlights = _a.highlights;
                return !!highlights;
            });
            var exactMatches = matches.filter(function (_a) {
                var head = _a.head;
                return head.name === input;
            });
            var headMatches = exactMatches.filter(function (_a) {
                var head = _a.head;
                return head.name === currentHead.name;
            });
            if (headMatches.length > 0) {
                return winjs.TPromise.as([new CurrentHeadEntry(this.gitService, this.messageService, headMatches[0].head, headMatches[0].highlights)]);
            }
            else if (exactMatches.length > 0) {
                return winjs.TPromise.as([new CheckoutHeadEntry(this.gitService, this.messageService, exactMatches[0].head, exactMatches[0].highlights)]);
            }
            var branchEntry = new BranchEntry(this.gitService, this.messageService, input);
            return winjs.TPromise.as([new model.QuickOpenEntryGroup(branchEntry, 'branch', false)]);
        };
        BranchCommand.prototype.getEmptyLabel = function (input) {
            return nls.localize(7, null);
        };
        return BranchCommand;
    }());
    var CommandQuickOpenHandler = (function (_super) {
        __extends(CommandQuickOpenHandler, _super);
        function CommandQuickOpenHandler(quickOpenService, gitService, messageService) {
            _super.call(this, quickOpenService, {
                prefix: 'git',
                commands: [
                    new CheckoutCommand(gitService, messageService),
                    new BranchCommand(gitService, messageService)
                ]
            });
        }
        CommandQuickOpenHandler = __decorate([
            __param(0, quickOpenService_1.IQuickOpenService),
            __param(1, IGitService),
            __param(2, message_1.IMessageService)
        ], CommandQuickOpenHandler);
        return CommandQuickOpenHandler;
    }(quickopenwb.CommandQuickOpenHandler));
    exports.CommandQuickOpenHandler = CommandQuickOpenHandler;
});
//# sourceMappingURL=gitQuickOpen.js.map