import connect from "connect";
import http from "http";
import bodyParser from "body-parser";
import * as WebSocket from "ws";

export const jestExpect = require("expect");

interface Options {
  port?: number;
}

interface State {
  server: http.Server;
  wss: WebSocket.Server;
  spies: Map<string, jest.Mock>;
  mockData: { [key: string]: string };
}

const defaultOptions: Options = {
  port: 62556,
};

// all state is contained in this variable
let state: State | undefined;

export function start(startOptions: Options = {}) {
  if (state) {
    throw new Error("Server is already started");
  }

  const options = Object.assign({}, defaultOptions, startOptions);

  var app = connect();
  app.use(bodyParser.json());

  app.use("/track", (req: any, res: any) => {
    const spy = getSpy(req.body.call);
    spy.apply(undefined, req.body.arguments || []);
    res.end();
  });

  app.use("/getMockState", (req: any, res: any) => {
    if (!state) {
      throw new Error("Server is not started");
    }
    res.end(JSON.stringify(state.mockData));
  });

  const server = http.createServer(app);
  server.listen(options.port);

  const wss = new WebSocket.Server({ server });

  // wss.on("connection", (ws: WebSocket) => {
  //   //connection is up, let's add a simple simple event
  //   ws.on("message", (message: string) => {
  //     //log the received message and send it back to the client
  //     console.log("received: %s", message);
  //     ws.send(`Hello, you sent -> ${message}`);
  //   });

  //   //send immediatly a feedback to the incoming connection
  //   ws.send("Hi there, I am a WebSocket server");
  // });

  state = {
    server,
    wss,
    spies: new Map(),
    mockData: {},
  };

  console.log("Starting detox-jest-spy server", options);
}

export function stop() {
  if (!state) {
    throw new Error("Server is already stopped");
  }
  state.server.close();
  state.wss.close();
  state = undefined;
}

export function getSpy(name: string) {
  if (!state) {
    throw new Error("Server is not started");
  }
  if (!state.spies.has(name)) {
    state.spies.set(name, jest.fn());
  }
  return state.spies.get(name) as jest.Mock;
}

export function expectSpy(name: string) {
  const spy = getSpy(name);
  return jestExpect(spy);
}

export function setMockData(key: any, val: any) {
  if (!state) {
    throw new Error("Server is not started");
  }

  state.mockData[key] = val;
  state.wss.clients.forEach((client) => {
    client.send(JSON.stringify(state?.mockData));
  });
}

export function unsetMockData(key: any) {
  if (!state) {
    throw new Error("Server is not started");
  }

  delete state.mockData[key];
}

export function clearMockData() {
  if (!state) {
    throw new Error("Server is not started");
  }

  state.mockData = {};
}
