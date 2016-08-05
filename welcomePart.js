/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'vs/base/browser/dom', 'vs/workbench/browser/part', 'vs/base/browser/builder', 'githubService', 'vs/base/browser/ui/inputbox/inputBox', 'vs/base/browser/ui/button/button', 'vs/base/common/keyCodes', 'vs/base/browser/keyboardEvent', 'vs/css!./welcomePart'], function (require, exports, dom, part_1, builder_1, githubService_1, inputBox_1, button_1, keyCodes_1, keyboardEvent_1) {
    'use strict';
    // TODO: localization
    var DEFAULT_INPUT_ARIA_LABEL = 'Enter a Repository';
    var WelcomePart = (function (_super) {
        __extends(WelcomePart, _super);
        function WelcomePart(id, githubService) {
            _super.call(this, id);
            this.githubService = githubService;
        }
        // The "monaco-*" classes are used to achieve the same look and feel as the Explorer.
        WelcomePart.prototype.createContentArea = function (parent) {
            var _this = this;
            this.container = builder_1.$(parent);
            var el = document.createElement('div');
            dom.addClass(el, 'monaco-workbench welcome-part');
            this.container.append(el, 0);
            if (this.githubService.isAuthenticated()) {
                // Encourage the user to choose a repository.
                var inputPrompt = document.createElement('span');
                // TODO: localization
                inputPrompt.textContent = 'Choose a Repository:';
                dom.addClass(inputPrompt, 'input-prompt');
                el.appendChild(inputPrompt);
                this.inputBox = new inputBox_1.InputBox(el, null, {
                    // TODO: localization
                    placeholder: 'user/repository',
                    ariaLabel: DEFAULT_INPUT_ARIA_LABEL
                });
                this.inputBox.focus();
                dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.KEY_DOWN, function (e) {
                    var keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (keyboardEvent.keyCode === keyCodes_1.KeyCode.Enter) {
                        githubService_1.openRepository(_this.inputBox.value);
                    }
                });
                this.openButton = new button_1.Button(el);
                // TODO: localization
                this.openButton.label = 'Open';
                this.openButton.on('click', function () {
                    githubService_1.openRepository(_this.inputBox.value);
                });
                // Present a list of the user's repositories.
                var header = document.createElement('div');
                dom.addClass(header, 'header');
                // TODO: localization
                header.innerHTML = "Your GitHub Repositories";
                el.appendChild(header);
                this.githubService.github.getUser().repos(function (err, repos) {
                    if (err)
                        return;
                    var list = document.createElement('div');
                    dom.addClass(list, 'monaco-tree monaco-tree-rows');
                    el.appendChild(list);
                    for (var _i = 0, repos_1 = repos; _i < repos_1.length; _i++) {
                        var repo = repos_1[_i];
                        var item = document.createElement('div');
                        dom.addClass(item, 'monaco-tree-row');
                        list.appendChild(item);
                        builder_1.$(item).bind(repo);
                        builder_1.$(item).on('click', function (e, builder) {
                            var repo = builder.getBinding();
                            githubService_1.openRepository(repo.full_name);
                        });
                        var anchor = document.createElement('a');
                        builder_1.$(anchor).text(repo.full_name);
                        builder_1.$(anchor).title(repo.description);
                        item.appendChild(anchor);
                    }
                });
            }
            else {
                // Encourage the user to sign in.
                // TODO: localization
                el.innerHTML = "<div class='content welcome-text'>Welcome! <a href='https://github.com/spiffcode/ghcode' target='_blank'>GH Code</a> is an\n\t\t\texperimental open source web IDE based on <a href='https://code.visualstudio.com' target='_blank'>Visual Studio Code</a>.<p>\n\t\t\tGH Code provides a fast, rich environment for browsing and editing GitHub repositories. Featuring:\n\t\t\t<ul>\n\t\t\t<li>Syntax highlighting</li>\n\t\t\t<li>IntelliSense for many languages including Javascript, Typescript, ...</li>\n\t\t\t<li>Lots of other cool stuff</li>\n\t\t\t</ul>\n\t\t\tSign in to your GitHub account to open GitHub repositories.</div><p>\n\t\t\t<input id='privateRepos' type='checkbox'>\n\t\t\t<label for='privateRepos'>Include my private repositories (optional)</label>";
                this.openButton = new button_1.Button(el);
                // TODO: localization
                this.openButton.label = 'Sign In';
                this.openButton.on('click', function () {
                    var checkbox = document.getElementById('privateRepos');
                    _this.githubService.authenticate(checkbox.checked);
                });
            }
            return this.container;
        };
        return WelcomePart;
    }(part_1.Part));
    exports.WelcomePart = WelcomePart;
});
//# sourceMappingURL=welcomePart.js.map