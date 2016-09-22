# GHEdit

#### INSTALLING
```bash
# Install TypeScript, if not already
npm install -g typescript

# Clone Visual Studio Code if you haven't already.
git clone https://github.com/spiffcode/vscode.git

# Build VS Code on OSX
# https://github.com/Microsoft/vscode/wiki/How-to-Contribute#build-and-run-from-source
cd vscode
./scripts/npm.sh install
./node_modules/.bin/gulp compile

# Build VS Code on Linux
# https://github.com/Microsoft/vscode/wiki/How-to-Contribute#build-and-run-from-source
./scripts/npm.sh install --arch=x64
./node_modules/.bin/gulp compile

cd ..

# Clone this repository.
git clone https://github.com/spiffcode/ghcode.git

# Create symbolic link to Visual Studio Code sources.
cd ghcode
ln -s ../../vscode/src/vs src/vs

# Install local npm packages
npm install
```
#### BUILDING
```bash
# From the ghcode directory
# Run once if first time or if vscode has been updated & compiled
npm run clean

# Perform a regular build of ghcode. This prodoces loose js files
npm run build

# Or, make an optimized build. This produces a packed but not minimized build
npm run build-opt

# Or, make a minimized build. This produces a packed and minimized build
npm run build-min

# Push to gh-pages. This makes a minimized build, then pushes that build
# to your gh-pages branch.
npm run push-min

# If you wish, you can push the loose file build (much slower to load).
# This does not perform a build, it just pushes the contents of out-build.
npm run push

```
#### RUNNING

Start a web server in the ghcode directory at port 8000. Use http-server, the node
app.

#### TO DO

M1: MS Preview

M2: Public Release

M3: Release followup
* Move GHEdit changes onto a vscode fork
* review TODO comments, use new convention for VSCode we want to keep for reference but is not considered a TODO
* DM: clean up stuff

#### BUGS

M1
<empty>

M2
* DM: keyboard shortcuts (e.g. cmd-p) should be disabled in welcome mode

M3
* Rename a file and keep commit history for that file
* githubFileService.resolve doesn't respect IResolveFileOptions (optimization)
* file mime type detection is crippled due to disabled Node dependency
* file encoding smarts (disabled due to Node dependency)
