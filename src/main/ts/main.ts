import $ from 'jquery';
import { ToolbarButton } from './modules/class_ToolbarButton';
import { appSettings } from './modules/appSettings';
import { IntervalManual } from './modules/class_InternalManual';
import { Log } from './modules/class_Log';
import { ElementLocation, DebugLevel } from './modules/enums';
import { Fullscreen } from './modules/class_Fullscreen';
import { GmConfig } from './modules/class_GmConfig';
import { ElementCssNode } from './modules/class_ElementCssNode';

declare const GM_registerMenuCommand: any;
declare const GM_config: any;

const validateIfTop = (): boolean => {
  return window.top === window.self;
};
const main = (tb: ToolbarButton) => {
 /*  $('#en_fs_frame').on('load', function () {
    // this event does not fire
    $(this).height($(this).contents().height() || '100%');
    $(this).width($(this).contents().width() || '100%');
    alert($(this).height);
  }); */
  const fs: Fullscreen = new Fullscreen();
  tb.onButtonClick().subscribe((sender, args) => {
    fs.requestFullscreen();
  });
};
if (validateIfTop()) {
  // #region [debug]
  const methodName: string = 'Main';
  const appDebugLevel = appSettings.debugLevel;
  const levelDebug = DebugLevel.debug;
  if (appDebugLevel >= levelDebug) {
    Log.debug(`${methodName}: Entered`);
    Log.debug(`${methodName}: valid Top`);
}
// #endregion debug
  $(document).ready(() => {
    const elBtn = new ElementCssNode({
      scriptLocation: ElementLocation.body,
      textContent: `// BUILD_INCLUDE('./scratch/css/button.min.css')[asjsstring]`
    });
    elBtn.start();
    const tb = new ToolbarButton(appSettings.buttonId);
    tb.init();
    const iv = new IntervalManual(500, 30);
    iv.onTick().subscribe((sender, args) => {
      // #region [debug]
      Log.debug(`${methodName}: Attempt number: ${args.count} to find Button: ${appSettings.buttonId}`);
      // #endregion debug
      if ($(`#${appSettings.buttonId}`).length === 1) {
        // #region [debug]
        Log.debug(`${methodName}: Attempt number: ${args.count} and found: ${appSettings.buttonId}`);
        // #endregion debug
        iv.dispose();
        main(tb);
      } else {
        tb.init();
      }
    });
    iv.onExpired().subscribe((sender, args) => {
      iv.dispose();
      Log.message(`${appSettings.shortName}: Unable to find injected button`);
    });
    iv.start();
  });
  // better to load GM_Config event if the script failed to load. The failure may have been due to a user tweak.
  // by loading GM_Config the user can change the settings even if the script fails to load.
  // #region [debug]
  if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: Registering GmConfig`); }
  // #endregion debug
  const gConfig: GmConfig = new GmConfig();
  gConfig.init();
  if (typeof GM_registerMenuCommand === 'function') {
    Log.message(appSettings.shortName + ': Entry Script: Registering: Open ' + appSettings.shortName + ' Options Menu');
    GM_registerMenuCommand(appSettings.menuName, (): void => {
      GM_config.open();
      Log.message(appSettings.shortName + ': Entry Script: Registered: Open ' + appSettings.shortName + ' Options Menu');
    });
  } else {
    Log.warn(`${appSettings.shortName}': Entry Script: Unable to Register: Open ${appSettings.shortName} Options Menu: GM_registerMenuCommand not found!`);
  }
  // #region [debug]
  if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: Leaving`); }
  // #endregion debug
}