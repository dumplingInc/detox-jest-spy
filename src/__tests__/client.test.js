jest.mock("react-native", function () { return ({
    Platform: {
        select: function (_a) {
            var ios = _a.ios, android = _a.android;
            return ios;
        }
    }
}); });
global.fetch = jest.fn();
var _a = require("../client"), configure = _a.configure, track = _a.track, getProxy = _a.getProxy;
describe("Client", function () {
    afterEach(function () {
        fetch.mockReset();
    });
    describe("configure", function () {
        it("saves config", function () {
            configure({ server: "https://test-server.com" });
            track("test", []);
            expect(fetch).toBeCalledWith("https://test-server.com/track", expect.objectContaining({}));
        });
    });
    describe("track", function () {
        it("calls fetch", function () {
            track("test", [1, "2", { obj: 3 }]);
            expect(fetch).toBeCalledWith(expect.stringContaining("http"), expect.objectContaining({
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    call: "test",
                    arguments: [1, "2", { obj: 3 }]
                })
            }));
        });
    });
    describe("getProxy", function () {
        it("calls fetch", function () {
            getProxy("Analytics").trackScreen("MyScreen", { id: 4 });
            expect(fetch).toBeCalledWith(expect.stringContaining("http"), expect.objectContaining({
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    call: "Analytics.trackScreen",
                    arguments: ["MyScreen", { id: 4 }]
                })
            }));
        });
    });
});
