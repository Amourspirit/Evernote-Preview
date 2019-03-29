import $ from 'jquery';
import { IElementCreate } from './interfaces';
import { elementsCreate } from './ElementHelper';
import { EventDispatcher, IEvent } from 'strongly-typed-events';
import { EventArgs } from './class_EventArgs';

export class ToolbarButton {
  protected eventBtnClick = new EventDispatcher<ToolbarButton, EventArgs>();
  private lPreviousTbBtnSel = '#gwt-debug-FormattingBar-outdentButton';
  private lBtnId: string;
  private lBtnLoaded: boolean = false;
  public constructor(btnId: string) {
    this.lBtnId = btnId;
  }
  public get isLoaded(): boolean {
    return this.isLoaded;
  }
  public init(): void {
    if (this.lBtnLoaded === false) {
      this.lBtnLoaded = this.load();
    }
  }
  public onButtonClick(): IEvent<ToolbarButton, EventArgs> {
    return this.eventBtnClick.asEvent();
  }
  private load(): boolean {
    const prev = $(this.lPreviousTbBtnSel).parent();
    if (prev.length === 0) {
      return false;
    }
    const code: IElementCreate = {
      tag: 'div',
      attrib: {
        id: this.lBtnId
      }
    };
    const btnEl = elementsCreate(code);
    prev.after(btnEl);
    const btn = $(`#${this.lBtnId}`);
    btn.addClass(prev.attr('class') + '');
    btn.attr('style', prev.attr('style') + '');
    const btnChild = prev.find('div').first().clone();
    // change the id of the cloned element
    btnChild.attr('id', `${this.lBtnId}_child`);
   /*  const imgWidth: string = '17px';
    const imgHeight: string = '17px';
    btnChild.css('background', `url('data:image/png;base64,${this.getIcon()}') 0px 0px no-repeat`);
    btnChild.css('background-size', `${imgWidth} ${imgHeight}`);
    btnChild.css('width', imgWidth);
    btnChild.css('height', imgHeight); */
    btnChild.attr('title', 'Fullscreen Preview');
    btn.append(btnChild);
    btnChild.appendTo(btn);
    const inp = btn.find('input');
    if (inp.length > 0) {
      inp.remove();
    }
    btn.on('click', () => {
      // button do someting
      const args = new EventArgs();
      this.eventBtnClick.dispatch(this, args);
    });
    return true;
  }
 /*  private getIcon(): string {
    // base 64
    let icon = 'iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAABCklEQV';
    icon += 'R42mNgoCJgAmJWJMyERQ0jmhpmdAV+QPwVCd8CYkEkeZCGnWhqqtANCQTi/0D8D4inArE3FptsgL';
    icon += 'gWiL9D1dZjM+QPEB8D4mdAbI7FO3JAfB6IbwPxU2yGgLzzA4jloc4GGaSNJC8MxOeA+BoQa0LZNe';
    icon += 'iG8AGxLzRAQWExC4jNkOQlgXgJEKtA+XZQlw0RwAxNF8iAhZAmCSDOhyoE+XU3EDsjySsC8VForI';
    icon += 'EMjwZiPXRDAoD4FxDrQKPxGjSmYIAXiHdAY80WiC8AcR22dPIXmlKvI8UCMhCERv8rIH6NK7HBUi';
    icon += 'woKnOAmA0t30QA8RR8KdYF6gIY3g1NO8gBPQ9NTfbgSw8AJPU70zS+7cQAAAAASUVORK5CYII=';
    return icon;
  } */
}