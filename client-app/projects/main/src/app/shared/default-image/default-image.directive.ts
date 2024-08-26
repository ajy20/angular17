import { Directive, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

@Directive({
  selector: 'img[src]',
  host: {
    '(error)': 'updateUrl()',
    '[src]': 'checkPath(src)'
  },
  standalone: true
})
export class DefaultImageDirective {
  @Input() src!: SafeUrl | null;

  private defaultImg: string = './assets/img/Missing.png';

  constructor() { }

  updateUrl() {
    return this.src = this.defaultImg;
  }

  public checkPath(src: SafeUrl | null): string {
    return src ? src as string : this.defaultImg;
  }
}
