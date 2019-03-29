// import jQ from 'jquery';
import { Log } from './class_Log';
import { appSettings } from './appSettings';
import { DebugLevel } from './enums';
import $ from 'jquery';
import { elementsCreate } from './ElementHelper';
import { IElementCreate } from './interfaces';
import { GmConfig } from './class_GmConfig';
declare const __EVERNOTE_ACTIONBEAN__: any;
// import * as jQ from 'jquery';
// see: https://stackoverflow.com/questions/33768509/how-to-make-an-iframe-to-go-fullscreen-on-a-button-click
export class Fullscreen {
  private lFullScreen: boolean = false;
  private lDivFsId: string = 'en_fs_prev';
  private lDivFsInnerId: string = 'en_fs_prev_inner';
  private lDivTitleId: string = 'en_fs_prev_title';
  private lIframeId: string = 'en_fs_frame';
  private lNoteTitleSel: string = '#gwt-debug-NoteTitleView-textBox';
  private lConfig: GmConfig = new GmConfig();
  public constructor() {
    this.addDoucmentEvent();
    $('body').append(this.getFullScreenHtml());
  }

  public requestFullscreen() {
    // #region [debug]
    const methodName: string = 'requestFullscreen';
    const appDebugLevel = appSettings.debugLevel;
    const levelDebug = DebugLevel.debug;
    if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: Entered`); }
    // #endregion debug
    if (this.lFullScreen === true) {
      // #region [debug]
      if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: Already in fullscreen. Unable to try again`); }
      // #endregion debug
      return;
    }
    const jqDiv = $(`#${this.lDivFsId}`);
    if (jqDiv.length !== 1) {
      Log.error(`${appSettings.shortName}: DIV: ${this.lDivFsId} is required and not found.`);
      return;
    }
    if (this.lConfig.fullScreenDisplayTitle === true) {
      const jqFsTitle = $(`#${this.lDivTitleId}`);
      jqFsTitle.text(this.getTitleText());
    }
    const div = jqDiv[0];
    if (div.requestFullscreen) {
      div.requestFullscreen();
    } else if ((div as any).webkitRequestFullscreen) {
      (div as any).webkitRequestFullscreen();
    } else if ((div as any).mozRequestFullScreen) {
      (div as any).mozRequestFullScreen();
    } else if ((div as any).msRequestFullscreen) {
      (div as any).msRequestFullscreen();
    }
    const jqIframe = $(`#${this.lIframeId}`);
    const url: string = this.getIframeSrc();
    jqIframe.attr('src', url);

    // #region [debug]
    if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: Leaving`); }
    // #endregion debug
  }
  private addDoucmentEvent(): void {
    // #region [debug]
    const methodName: string = 'addDoucmentEvent';
    const appDebugLevel = appSettings.debugLevel;
    const levelDebug = DebugLevel.debug;
    if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: Entered`); }
    // #endregion debug
    if (document.fullscreenEnabled) {
      document.addEventListener('fullscreenchange', this.fullScreenChange);
    } else if ((document as any).webkitExitFullscreen) {
      document.addEventListener('webkitfullscreenchange', this.fullScreenChange);
    } else if ((document as any).mozRequestFullScreen) {
      document.addEventListener('mozfullscreenchange', this.fullScreenChange);
    } else if ((document as any).msRequestFullscreen) {
      document.addEventListener('MSFullscreenChange', this.fullScreenChange);
    }
    // #region [debug]
    if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: Leaving`); }
    // #endregion debug
  }
  /**
   * Gets is the instance currently reports being in fullscreen.
   * @readonly
   */
  public get isInFullscreen(): boolean {
    return this.lFullScreen;
  }

  private fullScreenChange = (): void => {
    // #region [debug]
    const methodName: string = 'fullScreenChange';
    const appDebugLevel = appSettings.debugLevel;
    const levelDebug = DebugLevel.debug;
    if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: Entered`); }
    // #endregion debug
    if (document.fullscreenEnabled ||
      (document as any).webkitIsFullScreen ||
      (document as any).mozFullScreen ||
      (document as any).msFullscreenElement) {
      this.lFullScreen = !this.lFullScreen;
      this.toogleDivFsStyle();
      this.toggleElements();
      // #region [debug]
      if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: In Fullscreen`); }
      // #endregion debug
    } else {
      // #region [debug]
      if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: Not in Fullscreen`); }
      // #endregion debug
    }
    // #region [debug]
    if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: Leaving`); }
    // #endregion debug
  }

  private toggleElements(): void {
    // #region [debug]
    const methodName: string = 'toggleClass';
    const appDebugLevel = appSettings.debugLevel;
    const levelDebug = DebugLevel.debug;
    if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: Entered`); }
    // #endregion debug
    if (this.lFullScreen === false) {
      const jqIframe = $(`#${this.lIframeId}`);
      jqIframe.attr('src', 'about:blank');
      const jqFsTitle = $(`#${this.lDivTitleId}`);
      jqFsTitle.text('');
    }
    // #region [debug]
    if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: Leaving`); }
    // #endregion debug
  }
  private toogleDivFsStyle() {
    // #region [debug]
    const methodName: string = 'toogleDivFsStyle';
    const appDebugLevel = appSettings.debugLevel;
    const levelDebug = DebugLevel.debug;
    if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: Entered`); }
    // #endregion debug
    const el = document.getElementById(this.lDivFsId);
    if (el) {
      if (this.lFullScreen === true) {
        const fsStyle = `// BUILD_INCLUDE('./scratch/text/outter_div.txt')['asjsstring']`;
        el.setAttribute('style', fsStyle);
      } else {
        el.setAttribute('style', 'display:none');
      }
    }
    // #region [debug]
    if (appDebugLevel >= levelDebug) { Log.debug(`${methodName}: Leaving`); }
    // #endregion debug
  }
  private getFullScreenHtml(): HTMLElement {
    const h: IElementCreate = {
      tag: 'div',
      attrib: {
        id: this.lDivFsId,
        style: 'display:none;'
      },
      children: [{
        tag: 'div',
        attrib: {
          id: this.lDivTitleId,
          style: this.getTitleStyle(),
          class: this.getTitleClasses()
        }
        },
        {
          tag: 'div',
          attrib: {
            id: this.lDivFsInnerId,
            style: this.getDivFsInnerStyle()
          },
          children: [{
            tag: 'iframe',
            attrib: {
              id: this.lIframeId,
              src: 'about:blank',
              // scrolling: 'auto',
              // frameborder: '0',
              style: `// BUILD_INCLUDE('./scratch/text/iframe_css.txt')['asjsstring']`
            }
          }]
        }]
    };
    return elementsCreate(h);
  }
  private getTitleStyle() {
    if (this.lConfig.fullScreenDisplayTitle === true) {
      return `// BUILD_INCLUDE('./scratch/text/title_css.txt')['asjsstring']`;
    }
    return 'display:none;';
  }
  private getDivFsInnerStyle() {
    let style: string = `// BUILD_INCLUDE('./scratch/text/inner_div_css.txt')['asjsstring']`;
    if (this.lConfig.fullscreenPadding > 0) {
      let pad: number = this.lConfig.fullscreenPadding;
      switch (this.lConfig.fullscreenPaddingType) {
        case 'px':
          style += `padding-left:${pad}px;padding-right:${pad}px;`;
          break;
        case 'em':
          style += `padding-left:${pad}em;padding-right:${pad}em;`;
          break;
        default:
          if (pad > 45) {
            pad = 45;
          }
          style += `padding-left:${pad}%;padding-right:${pad}%;`;
          break;
      }
    }
    return style;
  }
  private getTitleText(): string {
    const jqEl = $(this.lNoteTitleSel);
    if (jqEl.length === 0) {
      Log.warn(`${appSettings.shortName}: Element for Evernote Title was not found`);
      return '';
    }
    return jqEl.val() + '';
  }
  private getTitleClasses(): string {
    if (this.lConfig.fullScreenDisplayTitle === false) {
      return '';
    }
    const jqEl = $(this.lNoteTitleSel);
    if (jqEl.length === 0) {
      Log.warn(`${appSettings.shortName}: Element for Evernote Title was not found`);
      return '';
    }
    return jqEl.attr('class') + '';
  }

  private getEvernoteParamByName(name: string, url?: string): string {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[#&]' + name + '(=([^&#]*)|&|$)');
    const results = regex.exec(url);
    if (!results) {
      return '';
    }
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  private getIframeSrc() {
    const n = this.getEvernoteParamByName('n');
    let strUrl: string = __EVERNOTE_ACTIONBEAN__.thriftEndpointBuilderConfig.shardUrlPrefix;
    strUrl += __EVERNOTE_ACTIONBEAN__.userShardId;
    strUrl += '/nl/';
    strUrl += __EVERNOTE_ACTIONBEAN__.currentUserId + '/';
    strUrl += n;
    strUrl += '?content=';
    // strUrl += encodeURIComponent($('#gwt-debug-NoteTitleView-textBox').val());
    return strUrl;
  }
}