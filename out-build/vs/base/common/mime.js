define(["require", "exports", 'vs/base/common/paths', 'vs/base/common/types', 'vs/base/common/strings', 'vs/base/common/glob'], function (require, exports, paths, types, strings, glob_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    exports.MIME_TEXT = 'text/plain';
    exports.MIME_BINARY = 'application/octet-stream';
    exports.MIME_UNKNOWN = 'application/unknown';
    var registeredAssociations = [];
    /**
     * Associate a text mime to the registry.
     */
    function registerTextMime(association) {
        // Register
        registeredAssociations.push(association);
        // Check for conflicts unless this is a user configured association
        if (!association.userConfigured) {
            registeredAssociations.forEach(function (a) {
                if (a.mime === association.mime || a.userConfigured) {
                    return; // same mime or userConfigured is ok
                }
                if (association.extension && a.extension === association.extension) {
                    console.warn("Overwriting extension <<" + association.extension + ">> to now point to mime <<" + association.mime + ">>");
                }
                if (association.filename && a.filename === association.filename) {
                    console.warn("Overwriting filename <<" + association.filename + ">> to now point to mime <<" + association.mime + ">>");
                }
                if (association.filepattern && a.filepattern === association.filepattern) {
                    console.warn("Overwriting filepattern <<" + association.filepattern + ">> to now point to mime <<" + association.mime + ">>");
                }
                if (association.firstline && a.firstline === association.firstline) {
                    console.warn("Overwriting firstline <<" + association.firstline + ">> to now point to mime <<" + association.mime + ">>");
                }
            });
        }
    }
    exports.registerTextMime = registerTextMime;
    /**
     * Clear text mimes from the registry.
     */
    function clearTextMimes(onlyUserConfigured) {
        if (!onlyUserConfigured) {
            registeredAssociations = [];
        }
        else {
            registeredAssociations = registeredAssociations.filter(function (a) { return !a.userConfigured; });
        }
    }
    exports.clearTextMimes = clearTextMimes;
    /**
     * Given a file, return the best matching mime type for it
     */
    function guessMimeTypes(path, firstLine) {
        if (!path) {
            return [exports.MIME_UNKNOWN];
        }
        path = path.toLowerCase();
        // 1.) User configured mappings have highest priority
        var configuredMime = guessMimeTypeByPath(path, registeredAssociations.filter(function (a) { return a.userConfigured; }));
        if (configuredMime) {
            return [configuredMime, exports.MIME_TEXT];
        }
        // 2.) Registered mappings have middle priority
        var registeredMime = guessMimeTypeByPath(path, registeredAssociations.filter(function (a) { return !a.userConfigured; }));
        if (registeredMime) {
            return [registeredMime, exports.MIME_TEXT];
        }
        // 3.) Firstline has lowest priority
        if (firstLine) {
            var firstlineMime = guessMimeTypeByFirstline(firstLine);
            if (firstlineMime) {
                return [firstlineMime, exports.MIME_TEXT];
            }
        }
        return [exports.MIME_UNKNOWN];
    }
    exports.guessMimeTypes = guessMimeTypes;
    function guessMimeTypeByPath(path, associations) {
        var filename = paths.basename(path);
        var filenameMatch;
        var patternMatch;
        var extensionMatch;
        for (var i = 0; i < associations.length; i++) {
            var association = associations[i];
            // First exact name match
            if (association.filename && filename === association.filename.toLowerCase()) {
                filenameMatch = association;
                break; // take it!
            }
            // Longest pattern match
            if (association.filepattern) {
                var target = association.filepattern.indexOf(paths.sep) >= 0 ? path : filename; // match on full path if pattern contains path separator
                if (glob_1.match(association.filepattern.toLowerCase(), target)) {
                    if (!patternMatch || association.filepattern.length > patternMatch.filepattern.length) {
                        patternMatch = association;
                    }
                }
            }
            // Longest extension match
            if (association.extension) {
                if (strings.endsWith(filename, association.extension.toLowerCase())) {
                    if (!extensionMatch || association.extension.length > extensionMatch.extension.length) {
                        extensionMatch = association;
                    }
                }
            }
        }
        // 1.) Exact name match has second highest prio
        if (filenameMatch) {
            return filenameMatch.mime;
        }
        // 2.) Match on pattern
        if (patternMatch) {
            return patternMatch.mime;
        }
        // 3.) Match on extension comes next
        if (extensionMatch) {
            return extensionMatch.mime;
        }
        return null;
    }
    function guessMimeTypeByFirstline(firstLine) {
        if (strings.startsWithUTF8BOM(firstLine)) {
            firstLine = firstLine.substr(1);
        }
        if (firstLine.length > 0) {
            for (var i = 0; i < registeredAssociations.length; ++i) {
                var association = registeredAssociations[i];
                if (!association.firstline) {
                    continue;
                }
                // Make sure the entire line matches, not just a subpart.
                var matches = firstLine.match(association.firstline);
                if (matches && matches.length > 0 && matches[0].length === firstLine.length) {
                    return association.mime;
                }
            }
        }
        return null;
    }
    function isBinaryMime(mimes) {
        if (!mimes) {
            return false;
        }
        var mimeVals;
        if (types.isArray(mimes)) {
            mimeVals = mimes;
        }
        else {
            mimeVals = mimes.split(',').map(function (mime) { return mime.trim(); });
        }
        return mimeVals.indexOf(exports.MIME_BINARY) >= 0;
    }
    exports.isBinaryMime = isBinaryMime;
    function isUnspecific(mime) {
        if (!mime) {
            return true;
        }
        if (typeof mime === 'string') {
            return mime === exports.MIME_BINARY || mime === exports.MIME_TEXT || mime === exports.MIME_UNKNOWN;
        }
        return mime.length === 1 && isUnspecific(mime[0]);
    }
    exports.isUnspecific = isUnspecific;
    function suggestFilename(theMime, prefix) {
        for (var i = 0; i < registeredAssociations.length; i++) {
            var association = registeredAssociations[i];
            if (association.userConfigured) {
                continue; // only support registered ones
            }
            if (association.mime === theMime && association.extension) {
                return prefix + association.extension;
            }
        }
        return null;
    }
    exports.suggestFilename = suggestFilename;
});
