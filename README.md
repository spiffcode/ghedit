# GH Code

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

# Perform a regular build of ghcode
npm run build

# Push to gh-pages
npm run push
```
#### RUNNING

Start a web server in the ghcode directory.

#### TO DO

M1: MS Preview
* DP: Minimizing out-build
* SL: search (https://developer.github.com/v3/search/#search-code)

M2: Public Release 
* sync up with latest vscode
* JSON Schema intellisense
* better Typescript intellisense (https://github.com/alexandrudima/monaco-typescript) 
* review TODO comments, use new convention for VSCode we want to keep for reference but is not considered a TODO

M3: Release followup
* DM: clean up stuff
* implement Info menu (Show Quick Start ("N key tips about this environment": choose a repo, creating files, saving, ...),
  Show All Commands, GitHub repo, About, documentation, release notes, join us on twitter, request features, report issues)

#### BUGS

M1
* SL: delete / rename doesn't work on a directory. Disable / Remove menu items?
* DM: welcome mode is unreadable under light theme

M2
* DM: tags aren't presented on ref menu
* DM: keyboard shortcuts (e.g. cmd-p) should be disabled in welcome mode
* DM: repo and ref menus need to scroll (or something) when too many items to fit in available view space
* search within Command Palette barfs

M3
* Rename a file loses commit history for that file
* need error message for invalid/inaccessible repo
* githubFileService.resolve doesn't respect IResolveFileOptions (optimization)
* file mime type detection is crippled due to disabled Node dependency
* file encoding smarts (disabled due to Node dependency)
