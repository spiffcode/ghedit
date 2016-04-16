/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'fs', 'path', 'vs/base/common/scorer', 'vs/base/common/arrays', 'vs/base/common/strings', 'vs/base/common/types', 'vs/base/common/glob', 'vs/base/node/extfs', 'vs/base/node/flow'], function (require, exports, fs, paths, scorer, arrays, strings, types, glob, extfs, flow) {
    'use strict';
    var FileWalker = (function () {
        function FileWalker(config) {
            this.config = config;
            this.filePattern = config.filePattern;
            this.excludePattern = config.excludePattern;
            this.includePattern = config.includePattern;
            this.maxResults = config.maxResults || null;
            this.maxFilesize = config.maxFilesize || null;
            this.walkedPaths = Object.create(null);
            this.resultCount = 0;
            this.isLimitHit = false;
            if (this.filePattern) {
                this.filePattern = this.filePattern.replace(/\\/g, '/'); // Normalize file patterns to forward slashes
                this.normalizedFilePatternLowercase = strings.stripWildcards(this.filePattern).toLowerCase();
            }
        }
        FileWalker.prototype.cancel = function () {
            this.isCanceled = true;
        };
        FileWalker.prototype.walk = function (rootFolders, extraFiles, onResult, done) {
            var _this = this;
            // Support that the file pattern is a full path to a file that exists
            this.checkFilePatternAbsoluteMatch(function (exists, size) {
                if (_this.isCanceled) {
                    return done(null, _this.isLimitHit);
                }
                // Report result from file pattern if matching
                if (exists) {
                    onResult({ path: _this.filePattern }, size);
                    // Optimization: a match on an absolute path is a good result and we do not
                    // continue walking the entire root paths array for other matches because
                    // it is very unlikely that another file would match on the full absolute path
                    return done(null, _this.isLimitHit);
                }
                // For each extra file
                if (extraFiles) {
                    extraFiles.forEach(function (extraFilePath) {
                        if (glob.match(_this.excludePattern, extraFilePath)) {
                            return; // excluded
                        }
                        // File: Check for match on file pattern and include pattern
                        _this.matchFile(onResult, extraFilePath, extraFilePath /* no workspace relative path */);
                    });
                }
                // For each root folder
                flow.parallel(rootFolders, function (absolutePath, perEntryCallback) {
                    extfs.readdir(absolutePath, function (error, files) {
                        if (error || _this.isCanceled || _this.isLimitHit) {
                            return perEntryCallback(null, null);
                        }
                        // Support relative paths to files from a root resource
                        return _this.checkFilePatternRelativeMatch(absolutePath, function (match, size) {
                            if (_this.isCanceled || _this.isLimitHit) {
                                return perEntryCallback(null, null);
                            }
                            // Report result from file pattern if matching
                            if (match) {
                                onResult({ path: match }, size);
                            }
                            return _this.doWalk(paths.normalize(absolutePath), '', files, onResult, perEntryCallback);
                        });
                    });
                }, function (err, result) {
                    done(err ? err[0] : null, _this.isLimitHit);
                });
            });
        };
        FileWalker.prototype.checkFilePatternAbsoluteMatch = function (clb) {
            if (!this.filePattern || !paths.isAbsolute(this.filePattern)) {
                return clb(false);
            }
            return fs.stat(this.filePattern, function (error, stat) {
                return clb(!error && !stat.isDirectory(), stat && stat.size); // only existing files
            });
        };
        FileWalker.prototype.checkFilePatternRelativeMatch = function (basePath, clb) {
            if (!this.filePattern || paths.isAbsolute(this.filePattern)) {
                return clb(null);
            }
            var absolutePath = paths.join(basePath, this.filePattern);
            return fs.stat(absolutePath, function (error, stat) {
                return clb(!error && !stat.isDirectory() ? absolutePath : null, stat && stat.size); // only existing files
            });
        };
        FileWalker.prototype.doWalk = function (absolutePath, relativeParentPathWithSlashes, files, onResult, done) {
            var _this = this;
            // Execute tasks on each file in parallel to optimize throughput
            flow.parallel(files, function (file, clb) {
                // Check canceled
                if (_this.isCanceled || _this.isLimitHit) {
                    return clb(null);
                }
                // If the user searches for the exact file name, we adjust the glob matching
                // to ignore filtering by siblings because the user seems to know what she
                // is searching for and we want to include the result in that case anyway
                var siblings = files;
                if (_this.config.filePattern === file) {
                    siblings = [];
                }
                // Check exclude pattern
                var currentRelativePathWithSlashes = relativeParentPathWithSlashes ? [relativeParentPathWithSlashes, file].join('/') : file;
                if (glob.match(_this.excludePattern, currentRelativePathWithSlashes, siblings)) {
                    return clb(null);
                }
                // Use lstat to detect links
                var currentAbsolutePath = [absolutePath, file].join(paths.sep);
                fs.lstat(currentAbsolutePath, function (error, lstat) {
                    if (error || _this.isCanceled || _this.isLimitHit) {
                        return clb(null);
                    }
                    // If the path is a link, we must instead use fs.stat() to find out if the
                    // link is a directory or not because lstat will always return the stat of
                    // the link which is always a file.
                    _this.statLinkIfNeeded(currentAbsolutePath, lstat, function (error, stat) {
                        if (error || _this.isCanceled || _this.isLimitHit) {
                            return clb(null);
                        }
                        // Directory: Follow directories
                        if (stat.isDirectory()) {
                            // to really prevent loops with links we need to resolve the real path of them
                            return _this.realPathIfNeeded(currentAbsolutePath, lstat, function (error, realpath) {
                                if (error || _this.isCanceled || _this.isLimitHit) {
                                    return clb(null);
                                }
                                if (_this.walkedPaths[realpath]) {
                                    return clb(null); // escape when there are cycles (can happen with symlinks)
                                }
                                _this.walkedPaths[realpath] = true; // remember as walked
                                // Continue walking
                                return extfs.readdir(currentAbsolutePath, function (error, children) {
                                    if (error || _this.isCanceled || _this.isLimitHit) {
                                        return clb(null);
                                    }
                                    _this.doWalk(currentAbsolutePath, currentRelativePathWithSlashes, children, onResult, clb);
                                });
                            });
                        }
                        else {
                            if (currentRelativePathWithSlashes === _this.filePattern) {
                                return clb(null); // ignore file if its path matches with the file pattern because checkFilePatternRelativeMatch() takes care of those
                            }
                            if (_this.maxFilesize && types.isNumber(stat.size) && stat.size > _this.maxFilesize) {
                                return clb(null); // ignore file if max file size is hit
                            }
                            _this.matchFile(onResult, currentAbsolutePath, currentRelativePathWithSlashes, stat.size);
                        }
                        // Unwind
                        return clb(null);
                    });
                });
            }, function (error) {
                if (error) {
                    error = arrays.coalesce(error); // find any error by removing null values first
                }
                return done(error && error.length > 0 ? error[0] : null, null);
            });
        };
        FileWalker.prototype.matchFile = function (onResult, absolutePath, relativePathWithSlashes, size) {
            if (this.isFilePatternMatch(relativePathWithSlashes) && (!this.includePattern || glob.match(this.includePattern, relativePathWithSlashes))) {
                this.resultCount++;
                if (this.maxResults && this.resultCount > this.maxResults) {
                    this.isLimitHit = true;
                }
                if (!this.isLimitHit) {
                    onResult({
                        path: absolutePath
                    }, size);
                }
            }
        };
        FileWalker.prototype.isFilePatternMatch = function (path) {
            // Check for search pattern
            if (this.filePattern) {
                if (this.filePattern === '*') {
                    return true; // support the all-matching wildcard
                }
                return scorer.matches(path, this.normalizedFilePatternLowercase);
            }
            // No patterns means we match all
            return true;
        };
        FileWalker.prototype.statLinkIfNeeded = function (path, lstat, clb) {
            if (lstat.isSymbolicLink()) {
                return fs.stat(path, clb); // stat the target the link points to
            }
            return clb(null, lstat); // not a link, so the stat is already ok for us
        };
        FileWalker.prototype.realPathIfNeeded = function (path, lstat, clb) {
            if (lstat.isSymbolicLink()) {
                return fs.realpath(path, function (error, realpath) {
                    if (error) {
                        return clb(error);
                    }
                    return clb(null, realpath);
                });
            }
            return clb(null, path);
        };
        return FileWalker;
    }());
    exports.FileWalker = FileWalker;
    var Engine = (function () {
        function Engine(config) {
            this.rootFolders = config.rootFolders;
            this.extraFiles = config.extraFiles;
            this.walker = new FileWalker(config);
        }
        Engine.prototype.search = function (onResult, onProgress, done) {
            this.walker.walk(this.rootFolders, this.extraFiles, onResult, done);
        };
        Engine.prototype.cancel = function () {
            this.walker.cancel();
        };
        return Engine;
    }());
    exports.Engine = Engine;
});
//# sourceMappingURL=fileSearch.js.map