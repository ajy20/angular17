import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Directive({
  selector: '[click.single],[click.double]',
  standalone: true
})
export class DoubleClickDirective implements OnInit, OnDestroy {
  @Input() debounceTime = 300;
  @Output('click.double') doubleClick = new EventEmitter();
  @Output('click.single') singleClick = new EventEmitter();

  private clicksSubject = new Subject<MouseEvent>();
  private subscription!: Subscription;

  constructor() { }

  ngOnInit() {
    this.subscription = this.clicksSubject.pipe(debounceTime(this.debounceTime)).subscribe(event => {
      if (event.type === 'click') {
        this.singleClick.emit(event);
      } else {
        this.doubleClick.emit(event);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('click', ['$event'])
  clickEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.clicksSubject.next(event);
  }
  @HostListener('dblclick', ['$event'])
  doubleClickEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.clicksSubject.next(event);
  }
}
