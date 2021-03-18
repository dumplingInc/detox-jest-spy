"use strict";
exports.__esModule = true;
exports.clearMockData = exports.unsetMockData = exports.setMockData = exports.expectSpy = exports.getSpy = exports.stop = exports.start = exports.jestExpect = void 0;
var connect_1 = require("connect");
var http_1 = require("http");
var body_parser_1 = require("body-parser");
exports.jestExpect = require("expect");
var defaultOptions = {
    port: 62556
};
// all state is contained in this variable
var state;
function start(startOptions) {
    if (startOptions === void 0) { startOptions = {}; }
    if (state) {
        throw new Error("Server is already started");
    }
    var options = Object.assign({}, defaultOptions, startOptions);
    var app = connect_1["default"]();
    app.use(body_parser_1["default"].json());
    app.use("/track", function (req, res) {
        var spy = getSpy(req.body.call);
        spy.apply(undefined, req.body.arguments || []);
        res.end();
    });
    app.use("/getMockState", function (req, res) {
        if (!state) {
            throw new Error("Server is not started");
        }
        res.send(state.mockData);
    });
    var server = http_1["default"].createServer(app);
    server.listen(options.port);
    state = {
        server: server,
        spies: new Map(),
        mockData: {}
    };
    console.log("Starting detox-jest-spy server", options);
}
exports.start = start;
function stop() {
    if (!state) {
        throw new Error("Server is already stopped");
    }
    state.server.close();
    state = undefined;
}
exports.stop = stop;
function getSpy(name) {
    if (!state) {
        throw new Error("Server is not started");
    }
    if (!state.spies.has(name)) {
        state.spies.set(name, jest.fn());
    }
    return state.spies.get(name);
}
exports.getSpy = getSpy;
function expectSpy(name) {
    var spy = getSpy(name);
    return exports.jestExpect(spy);
}
exports.expectSpy = expectSpy;
function setMockData(key, val) {
    if (!state) {
        throw new Error("Server is not started");
    }
    state.mockData[key] = val;
}
exports.setMockData = setMockData;
function unsetMockData(key) {
    if (!state) {
        throw new Error("Server is not started");
    }
    delete state.mockData[key];
}
exports.unsetMockData = unsetMockData;
function clearMockData() {
    if (!state) {
        throw new Error("Server is not started");
    }
    state.mockData = {};
}
exports.clearMockData = clearMockData;
