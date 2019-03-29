import { DebugLevel } from './enums';
// see // https://blog.neufund.org/why-we-have-banned-default-exports-and-you-should-do-the-same-d51fdc2cf2ad
/* export class AppSettings {
  public static readonly debugLevel: DebugLevel = DebugLevel.Info;
  public static readonly shortName: string = 'ENFS';
  public static readonly buttonPlacementSelector: string = 'div.note-view-content-container';
  public static readonly buttonId: string = 'enote-btn-id';
} */
export interface IappSettings {
  debugLevel: DebugLevel;
  shortName: string;
  buttonId: string;
  preKey: string;
  menuName: string;
}

export const appSettings: IappSettings  = {
  // #region [BUILD_REMOVE]
  // this next line will be deleted during grunt and replaced by debugLevel generated from package.json
  debugLevel: DebugLevel.debug,
  // #endregion BUILD_REMOVE
  // BUILD_INCLUDE('./scratch/text/debug_level.txt')
  shortName: 'ENPV',
  buttonId: 'bb_btn_en_pv',
  preKey: 'enpv_',
  menuName: `// BUILD_INCLUDE('./scratch/text/menu_options.txt')['asjsstring']`
};
