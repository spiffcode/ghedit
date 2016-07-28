/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Spiffcode, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

var github = require('lib/github');
import {Repository, TreeItem, Error as GithubError} from 'github';
import {TPromise} from 'vs/base/common/winjs.base';
import {IGithubService} from 'githubService';
import {Limiter} from 'vs/base/common/async';
import paths = require('vs/base/common/paths');

const S_IFMT = 0xf000;
const S_IFLNK = 0xa000;
const S_IFREG = 0x8000;
const S_IFDIR = 0x4000;

export interface IGithubTreeStat
{
    isDirectory() : boolean,
    isSymbolicLink() : boolean,
    size: number,
}

export interface IGithubTreeCache
{
    scheduleRefresh(): void,
    stat(path: string, cb: (error: Error, result?: IGithubTreeStat) => void): void;
    lstat(path: string, cb: (error: Error, result?: IGithubTreeStat) => void): void;
    realpath(path: string, cb: (error: Error, result?: string) => void) : void,
    readdir(path: string, callback: (error: Error, files?: string[]) => void): void,
}

export class GithubTreeStat
{
    constructor(private mode: number, public size: number) {
    }

    public isDirectory() : boolean {
        return (this.mode & S_IFMT) === S_IFDIR;
    }

    public isSymbolicLink() : boolean {
        return (this.mode & S_IFMT) === S_IFLNK;
    }
}

interface DirEntry {
    name: string,
    mode: number,
    size: number,
    realpath?: string,
    children?: { [name: string]: DirEntry }
}

export class GithubTreeCache implements IGithubTreeCache
{
    private refresh_counter: number;
    private tree: any;

    constructor(private githubService: IGithubService) {
        this.scheduleRefresh(true);
    }
 
    private findEntry(path: string): DirEntry {
        if (!this.tree)
            return null;
        let parts = path.split('/');
        let entry: DirEntry = this.tree;
        let i = 1;
        for (; i < parts.length - 1; i++) {
            entry = entry.children[parts[i]];
            if (!entry)
                return null;
        }
        if (parts[i] !== '')
            entry = entry.children[parts[i]];

        return entry;
    }

    private updateTreeWorker(items: TreeItem[], refresh_counter: number): void {
        let limiter = new Limiter(1);
        let symlinkPromises: TPromise<void>[] = [];

        // Rebuild the tree
        this.tree = { name: '', mode: S_IFDIR, size: 0 };
        items.forEach((item: TreeItem) => {
            let entry: DirEntry = {
                name: paths.basename(item.path),
                mode: parseInt(item.mode, 8),
                size: item.size
            };

            // Add the entry
            let dir = paths.dirname('/' + item.path);            
            let parent: DirEntry = this.findEntry(dir);
            if (!parent.children)
                parent.children = {};
            parent.children[entry.name] = entry;

            // If it is a symlink, the symlink path needs to be retrieved
            if ((entry.mode & S_IFMT) == S_IFLNK) {
                entry.realpath = null;
                symlinkPromises.push(limiter.queue(() => new TPromise<void>((s) => {
                    this.githubService.repo.getBlob(item.sha, (err: GithubError, path: string) => {
                        if (!err) {                            
                            entry.realpath = paths.makeAbsolute(paths.join(dir, path));
                        }
                        s(null);
                    });
                })));
            }
        });

        // Wait for the symlink resolution to finish
        TPromise.join(symlinkPromises).then(() => {
            if (refresh_counter != this.refresh_counter) {
                this.scheduleRefresh(true);
            } else {
                this.refresh_counter = 0;
            }
        });
    }

    private updateTree(): void {
        // Remember the counter at the start so we know when we've caught up
        let refresh_counter = this.refresh_counter;
        let error = false;
        this.githubService.repo.getRef('heads/' + this.githubService.ref, (err: GithubError, sha: string) => {
            if (err) {
                error = true;
                return;
            }
            this.githubService.repo.getTreeRecursive(sha, (err: GithubError, items: TreeItem[]) => {
                if (err) {
                    error = true
                    return;
                }
                this.updateTreeWorker(items, refresh_counter);
            });
        });
        if (error)
            this.scheduleRefresh(true);
    }

    public scheduleRefresh(force = false): void {
        // Edge trigger delayed updates        
        if (force)
            this.refresh_counter = 0;
        this.refresh_counter++;
        if (this.refresh_counter == 1) {
            setTimeout(() => this.updateTree(), 250);
        }
    }

    public stat(path: string, cb: (error: Error, result?: IGithubTreeStat) => void): void {
        // stat follows symlinks
        let entry = this.findEntry(path);
        if (!entry)
            return cb(new Error('Cannot find file or directory.'));

        while ((entry.mode & S_IFMT) === S_IFLNK) {
            if (!entry.realpath)
                return cb(new Error('Cannot resolve path for symlink.'));

            entry = this.findEntry(entry.realpath);
            if (!entry)
                return cb(new Error('Cannot find parent directory for resolved symlink.'));
        }

        return cb(null, new GithubTreeStat(entry.mode, entry.size));
    }

    public lstat(path: string, cb: (error: Error, result?: IGithubTreeStat) => void): void {
        // lstat does not follow symlinks
        let entry = this.findEntry(path);
        if (!entry)
            return cb(new Error('Cannot find file or directory.'));
        return cb(null, new GithubTreeStat(entry.mode, entry.size));
    }

    public realpath(path: string, cb: (error: Error, result?: string) => void) : void {
        let entry = this.findEntry(path);
        if (!entry)
            return cb(new Error('Cannot find file or directory.'));        
                
        if ((entry.mode & S_IFMT) === S_IFLNK) {
            if (entry.realpath)
                return cb(null, entry.realpath);
        }

        return cb(null, path);
    }

    public readdir(path: string, cb: (error: Error, files?: string[]) => void): void {
        let entry = this.findEntry(path);
        if (!entry)
            return cb(new Error('Cannot find file or directory.'));                

        if ((entry.mode & S_IFMT) !== S_IFDIR) {
            cb(new Error('This path is not a directory.'));
            return;
        }

        if (!entry.children) {
            cb(null, []);
            return;
        }

        cb(null, Object.keys(entry.children)); 
    }
}