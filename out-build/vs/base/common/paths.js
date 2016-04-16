define(["require", "exports", 'vs/base/common/platform', 'vs/base/common/strings'], function (require, exports, platform_1, strings_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    /**
     * The forward slash path separator.
     */
    exports.sep = '/';
    /**
     * The native path separator depending on the OS.
     */
    exports.nativeSep = platform_1.isWindows ? '\\' : '/';
    function relative(from, to) {
        from = normalize(from);
        to = normalize(to);
        var fromParts = from.split(exports.sep), toParts = to.split(exports.sep);
        while (fromParts.length > 0 && toParts.length > 0) {
            if (fromParts[0] === toParts[0]) {
                fromParts.shift();
                toParts.shift();
            }
            else {
                break;
            }
        }
        for (var i = 0, len = fromParts.length; i < len; i++) {
            toParts.unshift('..');
        }
        return toParts.join(exports.sep);
    }
    exports.relative = relative;
    var _dotSegment = /[\\\/]\.\.?[\\\/]?|[\\\/]?\.\.?[\\\/]/;
    function normalize(path, toOSPath) {
        if (!path) {
            return path;
        }
        // a path is already normal if it contains no .. or . parts
        // and already uses the proper path separator
        if (!_dotSegment.test(path)) {
            // badSep is the path separator we don't want. Usually
            // the backslash, unless isWindows && toOSPath
            var badSep = toOSPath && platform_1.isWindows ? '/' : '\\';
            if (path.indexOf(badSep) === -1) {
                return path;
            }
        }
        var parts = path.split(/[\\\/]/);
        for (var i = 0, len = parts.length; i < len; i++) {
            if (parts[i] === '.' && !!parts[i + 1]) {
                parts.splice(i, 1);
                i -= 1;
            }
            else if (parts[i] === '..' && !!parts[i - 1]) {
                parts.splice(i - 1, 2);
                i -= 2;
            }
        }
        return parts.join(toOSPath ? exports.nativeSep : exports.sep);
    }
    exports.normalize = normalize;
    function dirnames(path) {
        var value = path, done = false;
        function next() {
            if (value === '.' || value === '/' || value === '\\') {
                value = undefined;
                done = true;
            }
            else {
                value = dirname(value);
            }
            return {
                value: value,
                done: done
            };
        }
        return {
            next: next
        };
    }
    exports.dirnames = dirnames;
    /**
     * @returns the directory name of a path.
     */
    function dirname(path) {
        var idx = ~path.lastIndexOf('/') || ~path.lastIndexOf('\\');
        if (idx === 0) {
            return '.';
        }
        else if (~idx === 0) {
            return path[0];
        }
        else {
            return path.substring(0, ~idx);
        }
    }
    exports.dirname = dirname;
    /**
     * @returns the base name of a path.
     */
    function basename(path) {
        var idx = ~path.lastIndexOf('/') || ~path.lastIndexOf('\\');
        if (idx === 0) {
            return path;
        }
        else if (~idx === path.length - 1) {
            return basename(path.substring(0, path.length - 1));
        }
        else {
            return path.substr(~idx + 1);
        }
    }
    exports.basename = basename;
    /**
     * @returns {{.far}} from boo.far or the empty string.
     */
    function extname(path) {
        path = basename(path);
        var idx = ~path.lastIndexOf('.');
        return idx ? path.substring(~idx) : '';
    }
    exports.extname = extname;
    function getRootLength(path) {
        if (!path) {
            return 0;
        }
        path = path.replace(/\/|\\/g, '/');
        if (path[0] === '/') {
            if (path[1] !== '/') {
                // /far/boo
                return 1;
            }
            else {
                // //server/far/boo
                return 2;
            }
        }
        if (path[1] === ':') {
            if (path[2] === '/') {
                // c:/boo/far.txt
                return 3;
            }
            else {
                // c:
                return 2;
            }
        }
        if (path.indexOf('file:///') === 0) {
            return 8; // 8 -> 'file:///'.length
        }
        var idx = path.indexOf('://');
        if (idx !== -1) {
            return idx + 3; // 3 -> "://".length
        }
        return 0;
    }
    function join() {
        var parts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            parts[_i - 0] = arguments[_i];
        }
        var rootLen = getRootLength(parts[0]), root;
        // simply preserve things like c:/, //localhost/, file:///, http://, etc
        root = parts[0].substr(0, rootLen);
        parts[0] = parts[0].substr(rootLen);
        var allParts = [], endsWithSep = /[\\\/]$/.test(parts[parts.length - 1]);
        for (var i = 0; i < parts.length; i++) {
            allParts.push.apply(allParts, parts[i].split(/\/|\\/));
        }
        for (var i = 0; i < allParts.length; i++) {
            var part = allParts[i];
            if (part === '.' || part.length === 0) {
                allParts.splice(i, 1);
                i -= 1;
            }
            else if (part === '..' && !!allParts[i - 1] && allParts[i - 1] !== '..') {
                allParts.splice(i - 1, 2);
                i -= 2;
            }
        }
        if (endsWithSep) {
            allParts.push('');
        }
        var ret = allParts.join('/');
        if (root) {
            ret = root.replace(/\/|\\/g, '/') + ret;
        }
        return ret;
    }
    exports.join = join;
    function isUNC(path) {
        if (!platform_1.isWindows || !path) {
            return false; // UNC is a windows concept
        }
        path = this.normalize(path, true);
        return path[0] === exports.nativeSep && path[1] === exports.nativeSep;
    }
    exports.isUNC = isUNC;
    function isPosixAbsolute(path) {
        return path && path[0] === '/';
    }
    function makeAbsolute(path, isPathNormalized) {
        return isPosixAbsolute(!isPathNormalized ? normalize(path) : path) ? path : exports.sep + path;
    }
    exports.makeAbsolute = makeAbsolute;
    function isRelative(path) {
        return path && path.length > 1 && path[0] === '.';
    }
    exports.isRelative = isRelative;
    var _slash = '/'.charCodeAt(0);
    function isEqualOrParent(path, candidate) {
        if (path === candidate) {
            return true;
        }
        path = normalize(path);
        candidate = normalize(candidate);
        var candidateLen = candidate.length;
        var lastCandidateChar = candidate.charCodeAt(candidateLen - 1);
        if (lastCandidateChar === _slash) {
            candidate = candidate.substring(0, candidateLen - 1);
            candidateLen -= 1;
        }
        if (path === candidate) {
            return true;
        }
        if (!platform_1.isLinux) {
            // case insensitive
            path = path.toLowerCase();
            candidate = candidate.toLowerCase();
        }
        if (path === candidate) {
            return true;
        }
        if (path.indexOf(candidate) !== 0) {
            return false;
        }
        var char = path.charCodeAt(candidateLen);
        return char === _slash;
    }
    exports.isEqualOrParent = isEqualOrParent;
    // Reference: https://en.wikipedia.org/wiki/Filename
    var INVALID_FILE_CHARS = platform_1.isWindows ? /[\\/:\*\?"<>\|]/g : /[\\/]/g;
    var WINDOWS_FORBIDDEN_NAMES = /^(con|prn|aux|clock\$|nul|lpt[0-9]|com[0-9])$/i;
    function isValidBasename(name) {
        if (!name || name.length === 0 || /^\s+$/.test(name)) {
            return false; // require a name that is not just whitespace
        }
        INVALID_FILE_CHARS.lastIndex = 0; // the holy grail of software development
        if (INVALID_FILE_CHARS.test(name)) {
            return false; // check for certain invalid file characters
        }
        if (platform_1.isWindows && WINDOWS_FORBIDDEN_NAMES.test(name)) {
            return false; // check for certain invalid file names
        }
        if (name === '.' || name === '..') {
            return false; // check for reserved values
        }
        if (platform_1.isWindows && strings_1.endsWith(name, '.')) {
            return false; // Windows: file cannot end with a "."
        }
        if (platform_1.isWindows && name.length !== name.trim().length) {
            return false; // Windows: file cannot end with a whitespace
        }
        return true;
    }
    exports.isValidBasename = isValidBasename;
    exports.isAbsoluteRegex = /^((\/|[a-zA-Z]:\\)[^\(\)<>\\'\"\[\]]+)/;
    /**
     * If you have access to node, it is recommended to use node's path.isAbsolute().
     * This is a simple regex based approach.
     */
    function isAbsolute(path) {
        return exports.isAbsoluteRegex.test(path);
    }
    exports.isAbsolute = isAbsolute;
});
