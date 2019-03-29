declare const GM_config: any;
declare const GM_info: any;

import { appSettings } from './appSettings';

export class GmConfig {
  private gmConfig: any = GM_config;

  // #region [publicGet]
  /**
   * The ammount of padding to apply to the full screen dispaly
   * @readonly
   */
  public get fullscreenPadding(): number {
    return parseInt(this.gmConfig.get('fullscreenPadding'), 10);
  }
  /**
   * The type of padding to apply, percent | px | em
   * @readonly
   */
  public get fullscreenPaddingType(): string {
    return this.gmConfig.get('fullscreenPaddingType');
  }
  /**
   * Determins if the title is to be displayed in fullscreen.
   * @readonly
   */
  public get fullScreenDisplayTitle(): boolean {
    return this.gmConfig.get('fullScreenDisplayTitle');
  }
  // #endregion

  public init(): void {
    let strTitle = appSettings.menuName;
    if (GM_info && GM_info.script && GM_info.script.version) {
      strTitle = `${appSettings.menuName}: Version: ${GM_info.script.version}`;
    }
    // const initValues: GM_config.IGMconfigInitValues = {
    const initValues = {
      id: appSettings.preKey + 'Config', // The id used for this instance of GM_config
      title: strTitle, // Panel Title
      fields: // Fields object
      {
        fullscreenPadding:
        {
          section: ['Full Screen Optons'],
          label: 'Specify the amount left and right padding for full screen mode', // Appears next to field
          type: 'int', // Makes this setting a text input
          min: 0, // Optional lower range limit
          max: 200, // Optional upper range limit
          default: 5 // Default value if user doesnt change it
        },
        fullscreenPaddingType:
        {
          label: 'Select the type of padding',
          type: 'select',
          options: ['percent', 'px', 'em'],
          default: ['px']
        },
        fullScreenDisplayTitle:
        {
          type: 'checkbox',
          label: 'Display Title in full screen',
          default: true
        },
      },
      // css: '#MyConfig_section_0 { display: none !important; }' // CSS that will hide the section
    };
    // tslint:disable-next-line
    GM_config.init(initValues);
  }
}