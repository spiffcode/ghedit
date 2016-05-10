define(["require", "exports", 'fs', 'vs/base/common/platform'], function (require, exports, fs, env) {
    "use strict";
    // If the system is not debian but is on gnome, use gnome-terminal
    exports.DEFAULT_TERMINAL_LINUX = (env.isLinux && !fs.existsSync('/etc/debian_version') && process.env.DESKTOP_SESSION === 'gnome') ? 'gnome-terminal' : 'x-terminal-emulator';
    exports.DEFAULT_TERMINAL_WINDOWS = 'cmd';
});
//# sourceMappingURL=terminal.js.map