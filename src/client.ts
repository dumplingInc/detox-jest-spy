import { Platform } from "react-native";
interface Options {
  server?: string;
}
const DEFAULT_OPTIONS: Options = {
  server: Platform.select({
    ios: "http://localhost:62556", // iOS simulator uses same network
    android: "http://10.0.2.2:62556", // Android emulator loopback address
  }),
};
// state
let options = Object.assign({}, DEFAULT_OPTIONS);
const socket = new WebSocket(`wss://${options.server}`);

export function configure(configOptions: Options = {}) {
  options = Object.assign({}, DEFAULT_OPTIONS, configOptions);
}

/**
 * Sends a call to the spy server
 * @param name
 * @param args
 */
export function track(name: string, args: any[] = []) {
  return fetch(`${options.server}/track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      call: name,
      arguments: args,
    }),
  });
}

export async function subscribeToMockState(onUpdate: (state: any) => void) {
  socket.onmessage = function (event) {
    onUpdate(JSON.parse(event.data));
  };

  // return await fetch(`${options.server}/getMockState`, {
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });
}

/**
 * Returns a object that will track any method invocations
 * @param name label of the proxy object
 *
 * eg: getProxy('Amplitude').trackScreen('MyScreen')
 */
export function getProxy(name: string) {
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        return (...args: any[]) => {
          track(`${name}.${prop.toString()}`, args);
        };
      },
    }
  ) as any;
}
