# GHEdit

#### INSTALLING
```bash
# Clone this repository.
git clone https://github.com/spiffcode/ghedit.git

# Install npm packages
cd <project_root>
./scripts/npm.sh install
cd <project_root>/ghedit
npm install

# Build
cd <project_root>/ghedit
npm run build

# Build targets:
# build  - loose js files
# build-opt - packed not minimized. Requires ?b=opt when on localhost.
# build-min - packed and minimized. Requires ?b=min when on localhost.
```

#### RUNNING
```bash
npm run http-server
```

Now browse to http://localhost:8000

#### PUSHING
```bash
# Push the build-min version to github.io
npm run push
```

#### TO DO

* review TODO comments, use new convention for code we want to keep for reference but is not considered a TODO
* DM: clean up stuff

#### BUGS

* DM: keyboard shortcuts (e.g. cmd-p) should be disabled in welcome mode
* Rename a file and keep commit history for that file
* githubFileService.resolve doesn't respect IResolveFileOptions (optimization)
* file mime type detection is crippled due to disabled Node dependency
* file encoding smarts (disabled due to Node dependency)
