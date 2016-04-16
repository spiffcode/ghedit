/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/nls!vs/base/node/zip', 'path', 'fs', 'vs/base/common/async', 'vs/base/node/pfs', 'vs/base/common/winjs.base', 'yauzl'], function (require, exports, nls, path, fs_1, async_1, pfs_1, winjs_base_1, yauzl_1) {
    "use strict";
    function modeFromEntry(entry) {
        var attr = entry.externalFileAttributes >> 16 || 33188;
        return [448 /* S_IRWXU */, 56 /* S_IRWXG */, 7 /* S_IRWXO */]
            .map(function (mask) { return attr & mask; })
            .reduce(function (a, b) { return a + b; }, attr & 61440 /* S_IFMT */);
    }
    function extractEntry(zipfile, entry, targetPath, options) {
        var fileName = entry.fileName.replace(options.sourcePathRegex, '');
        var dirName = path.dirname(fileName);
        var targetDirName = path.join(targetPath, dirName);
        var targetFileName = path.join(targetPath, fileName);
        var mode = modeFromEntry(entry);
        return async_1.ninvoke(zipfile, zipfile.openReadStream, entry)
            .then(function (ostream) { return pfs_1.mkdirp(targetDirName)
            .then(function () { return new winjs_base_1.Promise(function (c, e) {
            var istream = fs_1.createWriteStream(targetFileName, { mode: mode });
            istream.once('finish', function () { return c(null); });
            istream.once('error', e);
            ostream.once('error', e);
            ostream.pipe(istream);
        }); }); });
    }
    function extractZip(zipfile, targetPath, options) {
        return new winjs_base_1.Promise(function (c, e) {
            var promises = [];
            zipfile.once('error', e);
            zipfile.on('entry', function (entry) {
                if (!options.sourcePathRegex.test(entry.fileName)) {
                    return;
                }
                promises.push(extractEntry(zipfile, entry, targetPath, options));
            });
            zipfile.once('close', function () { return winjs_base_1.Promise.join(promises).done(c, e); });
        });
    }
    function extract(zipPath, targetPath, options) {
        var sourcePathRegex = new RegExp(options.sourcePath ? "^" + options.sourcePath : '');
        var promise = async_1.nfcall(yauzl_1.open, zipPath);
        if (options.overwrite) {
            promise = promise.then(function (zipfile) { pfs_1.rimraf(targetPath); return zipfile; });
        }
        return promise.then(function (zipfile) { return extractZip(zipfile, targetPath, { sourcePathRegex: sourcePathRegex }); });
    }
    exports.extract = extract;
    function read(zipPath, filePath) {
        return async_1.nfcall(yauzl_1.open, zipPath).then(function (zipfile) {
            return new winjs_base_1.TPromise(function (c, e) {
                zipfile.on('entry', function (entry) {
                    if (entry.fileName === filePath) {
                        async_1.ninvoke(zipfile, zipfile.openReadStream, entry).done(function (stream) { return c(stream); }, function (err) { return e(err); });
                    }
                });
                zipfile.once('close', function () { return e(new Error(nls.localize(0, null, filePath))); });
            });
        });
    }
    function buffer(zipPath, filePath) {
        return read(zipPath, filePath).then(function (stream) {
            return new winjs_base_1.TPromise(function (c, e) {
                var buffers = [];
                stream.once('error', e);
                stream.on('data', function (b) { return buffers.push(b); });
                stream.on('end', function () { return c(Buffer.concat(buffers)); });
            });
        });
    }
    exports.buffer = buffer;
});
//# sourceMappingURL=zip.js.map