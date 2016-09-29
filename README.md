# GHEdit

[GHEdit](https://spiffcode.github.io/ghedit/) is a fast, rich, open source code editor that runs great in web browsers. It's directly integrated with GitHub so
you can work on your projects without installing anything.

<a target="_blank" href="https://spiffcode.github.io/ghedit/">Try it!</a>

<p align="center">
  <img alt="GHEdit in action" src="https://spiffcode.github.io/ghedit/demo.gif">
</p>

GHEdit is derived from Microsoft's [Visual Studio Code](https://code.visualstudio.com). We developed it to
learn about web-based development environments and think it is useful enough to share.

# Features

<ul>
	<li>GitHub integration (view and edit repositories and files, <i>in place</i>)</li>
	<li>Complete project explorer and text editor</li>
	<li>Syntax highlighting and auto-complete for all major programming and markup languages</li>
	<li>IntelliSense for Javascript, TypeScript, JSON</li>
	<li>Project-wide search and replace</li>
	<li>Fuzzy filename search</li>
	<li>Side-by-side file comparison</li>
	<li>Themes</li>
	<li>Customizable Keyboard Shortcuts</li>
	<li>Per-user, per-project customizable editor settings</li>
	<li>Free and <a href='https://github.com/spiffcode/ghedit'>Open Source!</a></li>
</ul>

# Documentation

Read the [documentation and FAQ](https://spiffcode.github.io/ghedit/documentation.html).

# Developing

#### INSTALLING SOURCE
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
# build - loose js files
# build-opt - packed not minimized. Requires ?b=opt when on localhost.
# build-min - packed and minimized. Requires ?b=min when on localhost.
```

#### RUNNING LOCALLY
```bash
npm run http-server
```

Now browse to [http://localhost:8000](http://localhost:8000)

#### PUSHING TO GITHUB.IO
```bash
# Push the build-min version to github.io
npm run push
```
