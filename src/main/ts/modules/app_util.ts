import { Log } from './class_Log';
import { appSettings } from './appSettings';
import { DebugLevel} from './enums';

/**
   * Test if a string value is a function in the global scope of a window
   * @param fnstring Function Name as string
   *
   * @link https://www.sitepoint.com/call-javascript-function-string-without-using-eval
   * @returns Returns true if the scring value matches a global function; otherwise false.
   */
export const utilFnAsStringExist = (fnstring: string): boolean => {
  // #region [debug]
  const methodName: string = 'fnAsStringExist';
  // Higher price to check using enumes each time so capture the values here
  const appDebugLevel = appSettings.debugLevel;
  const levelDebug = DebugLevel.debug;

  if (appDebugLevel >= levelDebug) {
    Log.debug(`${methodName}: Entered.`);
  }
  Log.debug(`${methodName} Looking for function: ${fnstring}`);
  // #endregion debug
  // find object
  // see: https://stackoverflow.com/questions/42193262/element-implicitly-has-an-any-type-because-type-window-has-no-index-signatur
  const fn = (window as any)[fnstring];
  // is object a function?
  if (typeof fn === 'function') {
    // #region [debug]
    if (appDebugLevel >= levelDebug) {
      Log.debug(`${methodName}: found function: ${fnstring}.`);
      Log.debug(`${methodName}: Leaving.`);
    }
    // #endregion debug
    return true;
  } else {
    // #region [debug]
    if (appDebugLevel >= levelDebug) {
      Log.debug(`${methodName}: unable to find function: ${fnstring}.`);
      Log.debug(`${methodName}: Leaving.`);
    }
    // #endregion debug
    return false;
  }
};
export const utilCreateElement = <T extends HTMLElement>(tag: string): T => {
  const D: Document = document;
  // const val = ElementCreateTypes[eType];
  const node: T = (D as any).createElement(tag);
  return node;
};
