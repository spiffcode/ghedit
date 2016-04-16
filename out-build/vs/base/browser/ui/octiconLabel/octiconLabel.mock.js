define(["require", "exports", 'vs/base/common/strings'], function (require, exports, strings_1) {
    "use strict";
    function expand(text) {
        return text;
    }
    var MockOcticonLabel = (function () {
        function MockOcticonLabel(container) {
            this._container = container;
        }
        Object.defineProperty(MockOcticonLabel.prototype, "text", {
            set: function (text) {
                var innerHTML = text || '';
                innerHTML = strings_1.escape(innerHTML);
                innerHTML = expand(innerHTML);
                this._container.innerHTML = innerHTML;
            },
            enumerable: true,
            configurable: true
        });
        return MockOcticonLabel;
    }());
    var mock = {
        expand: expand,
        OcticonLabel: MockOcticonLabel
    };
    return mock;
});
//# sourceMappingURL=octiconLabel.mock.js.map