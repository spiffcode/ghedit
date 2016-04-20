# GH Code

#### INSTALLING

    # Clone Visual Studio Code if you haven't already.
    git clone https://github.com/spiffcode/vscode.git
    
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

#### RUNNING

Start a web server in the ghcode directory.

#### TO DO

* move 'dev' stuff to master, 'publish' to gh-pages branch
* user auth UI
* session preservation (e.g. across refresh, browser/tab close/open)
* user settings
* project aka workspace settings
* syntax coloring
* all the other language smarts
* themes
* markdown preview
* search
* repo/branch/tag selection
* saving
* DM: clean up stuff
* 'no repository' experience (Welcome & about text, clear means to open a repo, no useless/confusing panels)

#### BUGS

* need error message for invalid/inaccessable repo
* githubFileService.resolve doesn't respect IResolveFileOptions (optimmization)
* file mime type detection is crippled due to disabled Node dependency
