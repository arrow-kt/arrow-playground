import {fetch} from 'whatwg-fetch';
import URLSearchParams from 'url-search-params';
import TargetPlatform from "./target-platform";
import {API_URLS} from "./config";
import flatten from 'flatten'
import {
  findSecurityException,
  getExceptionCauses,
  processErrors,
  processJUnitResults,
  processJVMOutput
} from "./view/output-view";

/**
 * @typedef {Object} KotlinVersion
 * @property {string} version
 * @property {string} build
 * @property {boolean} obsolete
 * @property {boolean} latestStable
 * @property {boolean} hasScriptJar
 * @property {string|null} stdlibVersion
 */

const CACHE = {
  compilerVersions: null,
};
const DEFAULT_FILE_NAME = "File.kt";

export default class WebDemoApi {
  /**
   * @return {Promise<Array<KotlinVersion>>}
   */
  static getCompilerVersions() {
    if (!CACHE.compilerVersions) {
      CACHE.compilerVersions = fetch(API_URLS.VERSIONS)
        .then(response => response.json())
        .catch(() => (CACHE.compilerVersions = null));
    }

    return CACHE.compilerVersions;
  }

  /**
   * Request on execute Kotlin code.
   *
   * @param code            - string
   * @param arrowVersion    - string Arrow version
   * @param compilerVersion - string kotlin compiler
   * @param platform        - TargetPlatform
   * @param args            - command line arguments
   * @param theme           - theme of editor
   * @param onTestPassed    - function will call after test's passed
   * @param onTestFailed    - function will call after test's failed
   * @param hiddenDependencies   - read only additional files
   * @returns {*|PromiseLike<T>|Promise<T>}
   */
  static executeKotlinCode(code, arrowVersion, compilerVersion, platform, args, theme, hiddenDependencies, onTestPassed, onTestFailed) {
    return executeCode(API_URLS.COMPILE(platform), code, arrowVersion, compilerVersion, platform, args, hiddenDependencies).then(function (data) {
      let output = "";
      let errorsAndWarnings = flatten(Object.values(data.errors));
      let errors = errorsAndWarnings.filter(error => error.severity === "ERROR");
      if (errors.length > 0) {
        output = processErrors(errors, theme);
      } else {
        switch (platform) {
          case TargetPlatform.JAVA:
            if (data.text) output = processJVMOutput(data.text, theme);
            break;
        }
      }
      let exceptions = null;
      if (data.exception != null) {
        exceptions = findSecurityException(data.exception);
        exceptions.causes = getExceptionCauses(exceptions);
        exceptions.cause = undefined;
      }
      return {
        errors: errorsAndWarnings,
        output: output,
        exception: exceptions
      }
    })
  }
}

function executeCode(url, code, arrowVersion, compilerVersion, targetPlatform, args, hiddenDependencies, options) {
  const files = [buildFileObject(code, DEFAULT_FILE_NAME)]
    .concat(hiddenDependencies.map((file, index) => buildFileObject(file, `hiddenDependency${index}.kt`)));

  const body = {
    args,
    files,
    confType: targetPlatform.id,
    ...(options || {}),
  };

  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    }
  }).then(response => response.json())
}

/**
 *
 * Build file object.
 * @param code - string code
 * @param fileName - name of file
 * @returns {{name: string, text: string, publicId: string}} - file object
 */
function buildFileObject(code, fileName) {
  return {
    "name": fileName,
    "text": code,
    "publicId": ""
  }
}
