import {getConfigFromElement, getCurrentScript} from './utils';
import TargetPlatform from "./target-platform";

const currentScript = getCurrentScript();

export const RUNTIME_CONFIG = {...getConfigFromElement(currentScript)};

/**
 * API Paths
 *
 * @type {{COMPILE: string, VERSIONS: string}}
 */
export const API_URLS = {
  server: RUNTIME_CONFIG.server || __WEBDEMO_URL__,
  COMPILE(platform) {
    let url;

    switch (platform) {
      case TargetPlatform.JAVA:
        url = `${this.server}/api/compiler/run`;
        break;
      default:
        console.warn(`Unknown ${platform.id} , used by default JVM`)
        url = `${this.server}/api/compiler/run`;
        break;
    }

    return url;
  },
  get VERSIONS() {
    // return `${this.server}/versions`;
    // It doesn't make sense to start the lambda function every time to get the versions
    const isReleaseVersion = /release/g;
    const defaultServer = `${this.server}`.toLowerCase();
    if (defaultServer.match(isReleaseVersion) != null) {
      return `https://arrow-kt.io/kotlin-compiler-server/versions/release/versions.json`;
    }
    return `https://arrow-kt.io/kotlin-compiler-server/versions/snapshot/versions.json`;
  }
};

/**
 * @typedef {Object} KotlinRunCodeConfig
 */
export default {
  selector: 'code',
  compilerVersion: undefined,
  arrowVersion: undefined
}
