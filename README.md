# GH Code

#### INSTALLING
```bash
# Clone Visual Studio Code if you haven't already.
git clone https://github.com/spiffcode/vscode.git

# Build VS Code on OSX
# https://github.com/Microsoft/vscode/wiki/How-to-Contribute#build-and-run-from-source
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
ln -s ../vscode/src/vs src/vs

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

* DM: user auth UI
* session preservation (e.g. across refresh, browser/tab close/open)
* SL: user settings
* project aka workspace settings
* themes
* search
* DM: repo/branch/tag selection
* DM: clean up stuff
* 'no repository' experience (Welcome & about text, clear means to open a repo, no useless/confusing panels)
* Explorer functionality: New File, New Folder, File Copy, File Paste, Rename, Delete

#### BUGS

* need error message for invalid/inaccessible repo
* githubFileService.resolve doesn't respect IResolveFileOptions (optimization)
* file mime type detection is crippled due to disabled Node dependency
* file encoding smarts (disabled due to Node dependency)
