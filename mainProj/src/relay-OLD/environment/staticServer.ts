"use client"
import { fetchFn } from "@/relay/environment/fetchFn";
import {
  Environment,
  Network,
  Store,
  RecordSource,
} from "relay-runtime";
import RelayModernEnvironment from "relay-runtime/lib/store/RelayModernEnvironment";

//前端服务器位置SSG的，登录时刻和后端服务器通信用的。并不是浏览器用的，也不是SSR水和用的。不存在Hydration逻辑！
let ssgRelayEnvironment: RelayModernEnvironment | null = null;

/**
 * Creates a Relay Environment, while hydrating the Relay store with the responses
 * that were previously received from the server.
 *
 * @param resolveReplaySubject A function used to produce a ReplaySubject for a given queryId.
 * @returns The SSG-server Relay environment.
 */
export function createStaticRelayEnvironment() {
  if (ssgRelayEnvironment) {
    return ssgRelayEnvironment;
  }
  console.log("create ServerOnly-relay environment");
  // Create a new environment or reuse the existing one, if one has already been created.
  ssgRelayEnvironment ||= new Environment({
    network: Network.create(fetchFn),
    store: new Store(new RecordSource()),
    log: (event) => console.log(event),
  });
  return ssgRelayEnvironment;
}
