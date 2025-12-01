import { RequestManager } from "./framework/core/requestManager";
import { Logger } from "./framework/core/logger";

async function globalTeardown() {
  await RequestManager.dispose();
  RequestManager.resetConfiguration();
  Logger.reset();
}

export default globalTeardown;
