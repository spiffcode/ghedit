define(["require", "exports"], function (require, exports) {
    "use strict";
    function mock_html_beautify(value, options) {
        return value;
    }
    var mock = {
        html_beautify: mock_html_beautify
    };
    return mock;
});
//# sourceMappingURL=beautify-html.mock.js.map