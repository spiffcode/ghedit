define(["require", "exports", 'vs/base/common/errors', 'vs/base/common/event', 'vs/base/common/mime', 'vs/base/common/strings', 'vs/editor/common/modes/modesRegistry'], function (require, exports, errors_1, event_1, mime, strings, modesRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var LanguagesRegistry = (function () {
        function LanguagesRegistry(useModesRegistry) {
            var _this = this;
            if (useModesRegistry === void 0) { useModesRegistry = true; }
            this._onDidAddModes = new event_1.Emitter();
            this.onDidAddModes = this._onDidAddModes.event;
            this.knownModeIds = {};
            this.mime2LanguageId = {};
            this.name2LanguageId = {};
            this.id2Name = {};
            this.name2Extensions = {};
            this.compatModes = {};
            this.lowerName2Id = {};
            this.id2ConfigurationFiles = {};
            if (useModesRegistry) {
                this._registerCompatModes(modesRegistry_1.ModesRegistry.getCompatModes());
                modesRegistry_1.ModesRegistry.onDidAddCompatModes(function (m) { return _this._registerCompatModes(m); });
                this._registerLanguages(modesRegistry_1.ModesRegistry.getLanguages());
                modesRegistry_1.ModesRegistry.onDidAddLanguages(function (m) { return _this._registerLanguages(m); });
            }
        }
        LanguagesRegistry.prototype._registerCompatModes = function (defs) {
            var addedModes = [];
            for (var i = 0; i < defs.length; i++) {
                var def = defs[i];
                this._registerLanguage({
                    id: def.id,
                    extensions: def.extensions,
                    filenames: def.filenames,
                    firstLine: def.firstLine,
                    aliases: def.aliases,
                    mimetypes: def.mimetypes
                });
                this.compatModes[def.id] = {
                    moduleId: def.moduleId,
                    ctorName: def.ctorName
                };
                addedModes.push(def.id);
            }
            this._onDidAddModes.fire(addedModes);
        };
        LanguagesRegistry.prototype._registerLanguages = function (desc) {
            var addedModes = [];
            for (var i = 0; i < desc.length; i++) {
                this._registerLanguage(desc[i]);
                addedModes.push(desc[i].id);
            }
            this._onDidAddModes.fire(addedModes);
        };
        LanguagesRegistry.prototype._registerLanguage = function (lang) {
            this.knownModeIds[lang.id] = true;
            var primaryMime = null;
            if (typeof lang.mimetypes !== 'undefined' && Array.isArray(lang.mimetypes)) {
                for (var i = 0; i < lang.mimetypes.length; i++) {
                    if (!primaryMime) {
                        primaryMime = lang.mimetypes[i];
                    }
                    this.mime2LanguageId[lang.mimetypes[i]] = lang.id;
                }
            }
            if (!primaryMime) {
                primaryMime = 'text/x-' + lang.id;
                this.mime2LanguageId[primaryMime] = lang.id;
            }
            if (Array.isArray(lang.extensions)) {
                for (var _i = 0, _a = lang.extensions; _i < _a.length; _i++) {
                    var extension = _a[_i];
                    mime.registerTextMime({ mime: primaryMime, extension: extension });
                }
            }
            if (Array.isArray(lang.filenames)) {
                for (var _b = 0, _c = lang.filenames; _b < _c.length; _b++) {
                    var filename = _c[_b];
                    mime.registerTextMime({ mime: primaryMime, filename: filename });
                }
            }
            if (Array.isArray(lang.filenamePatterns)) {
                for (var _d = 0, _e = lang.filenamePatterns; _d < _e.length; _d++) {
                    var filenamePattern = _e[_d];
                    mime.registerTextMime({ mime: primaryMime, filepattern: filenamePattern });
                }
            }
            if (typeof lang.firstLine === 'string' && lang.firstLine.length > 0) {
                var firstLineRegexStr = lang.firstLine;
                if (firstLineRegexStr.charAt(0) !== '^') {
                    firstLineRegexStr = '^' + firstLineRegexStr;
                }
                try {
                    var firstLineRegex = new RegExp(firstLineRegexStr);
                    if (!strings.regExpLeadsToEndlessLoop(firstLineRegex)) {
                        mime.registerTextMime({ mime: primaryMime, firstline: firstLineRegex });
                    }
                }
                catch (err) {
                    // Most likely, the regex was bad
                    errors_1.onUnexpectedError(err);
                }
            }
            this.lowerName2Id[lang.id.toLowerCase()] = lang.id;
            if (typeof lang.aliases !== 'undefined' && Array.isArray(lang.aliases)) {
                for (var i = 0; i < lang.aliases.length; i++) {
                    if (!lang.aliases[i] || lang.aliases[i].length === 0) {
                        continue;
                    }
                    this.lowerName2Id[lang.aliases[i].toLowerCase()] = lang.id;
                }
            }
            if (!this.id2Name[lang.id]) {
                var bestName = null;
                if (typeof lang.aliases !== 'undefined' && Array.isArray(lang.aliases) && lang.aliases.length > 0) {
                    bestName = lang.aliases[0];
                }
                else {
                    bestName = lang.id;
                }
                if (bestName) {
                    this.name2LanguageId[bestName] = lang.id;
                    this.name2Extensions[bestName] = lang.extensions;
                    this.id2Name[lang.id] = bestName || '';
                }
            }
            if (typeof lang.configuration === 'string') {
                this.id2ConfigurationFiles[lang.id] = this.id2ConfigurationFiles[lang.id] || [];
                this.id2ConfigurationFiles[lang.id].push(lang.configuration);
            }
        };
        LanguagesRegistry.prototype.isRegisteredMode = function (mimetypeOrModeId) {
            // Is this a known mime type ?
            if (hasOwnProperty.call(this.mime2LanguageId, mimetypeOrModeId)) {
                return true;
            }
            // Is this a known mode id ?
            return hasOwnProperty.call(this.knownModeIds, mimetypeOrModeId);
        };
        LanguagesRegistry.prototype.getRegisteredModes = function () {
            return Object.keys(this.knownModeIds);
        };
        LanguagesRegistry.prototype.getRegisteredLanguageNames = function () {
            return Object.keys(this.name2LanguageId);
        };
        LanguagesRegistry.prototype.getLanguageName = function (modeId) {
            return this.id2Name[modeId] || null;
        };
        LanguagesRegistry.prototype.getModeIdForLanguageNameLowercase = function (languageNameLower) {
            return this.lowerName2Id[languageNameLower] || null;
        };
        LanguagesRegistry.prototype.getConfigurationFiles = function (modeId) {
            return this.id2ConfigurationFiles[modeId] || [];
        };
        LanguagesRegistry.prototype.getMimeForMode = function (theModeId) {
            var keys = Object.keys(this.mime2LanguageId);
            for (var i = 0, len = keys.length; i < len; i++) {
                var _mime = keys[i];
                var modeId = this.mime2LanguageId[_mime];
                if (modeId === theModeId) {
                    return _mime;
                }
            }
            return null;
        };
        LanguagesRegistry.prototype.extractModeIds = function (commaSeparatedMimetypesOrCommaSeparatedIdsOrName) {
            var _this = this;
            if (!commaSeparatedMimetypesOrCommaSeparatedIdsOrName) {
                return [];
            }
            return (commaSeparatedMimetypesOrCommaSeparatedIdsOrName.
                split(',').
                map(function (mimeTypeOrIdOrName) { return mimeTypeOrIdOrName.trim(); }).
                map(function (mimeTypeOrIdOrName) {
                return _this.mime2LanguageId[mimeTypeOrIdOrName] || mimeTypeOrIdOrName;
            }).
                filter(function (modeId) {
                return _this.knownModeIds[modeId];
            }));
        };
        LanguagesRegistry.prototype.getModeIdsFromLanguageName = function (languageName) {
            if (!languageName) {
                return [];
            }
            if (hasOwnProperty.call(this.name2LanguageId, languageName)) {
                return [this.name2LanguageId[languageName]];
            }
            return [];
        };
        LanguagesRegistry.prototype.getModeIdsFromFilenameOrFirstLine = function (filename, firstLine) {
            if (!filename && !firstLine) {
                return [];
            }
            var mimeTypes = mime.guessMimeTypes(filename, firstLine);
            return this.extractModeIds(mimeTypes.join(','));
        };
        LanguagesRegistry.prototype.getCompatMode = function (modeId) {
            return this.compatModes[modeId] || null;
        };
        LanguagesRegistry.prototype.getExtensions = function (languageName) {
            return this.name2Extensions[languageName];
        };
        return LanguagesRegistry;
    }());
    exports.LanguagesRegistry = LanguagesRegistry;
});
//# sourceMappingURL=languagesRegistry.js.map