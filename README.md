# ghcode

#### INSTALLING

    # Clone Visual Studio Code if you haven't already.
    git clone https://github.com/Microsoft/vscode.git
    
    # Clone this repository.  
    git clone https://github.com/spiffcode/ghcode.git
    
    # Switch to gh-pages branch.
    cd ghcode
    git checkout gh-pages

    # Create symbolic link to Visual Studio Code sources.
    cd src
    ln -s ../../vscode/src/vs vs

#### BUILDING

    # From repo clone dir, e.g. ghcode
    cd src
    
    # Requires TypeScript to be installed.
    tsc
    cp workbench.main.js ../out-build

#### RUNNING

Start a web server in the ghcode directory.

#### TO DO

* Have build copy workbench.main.js to build dir.
* Move index.html to src and have build copy it to build dir.
* Run from build dir.