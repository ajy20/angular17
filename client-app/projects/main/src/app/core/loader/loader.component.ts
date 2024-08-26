import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { filter, map, Observable, Subject, takeUntil, tap, timer } from 'rxjs';

@Component({
  selector: 'csps-loader',
  standalone: true,
  imports: [CommonModule, NgbProgressbarModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnInit {
  // Indicates whether navigation is on-going 
  loading$!: Observable<boolean>;

  // The progress status for the progress bar
  progress: number = 0;

  // Used for cleaning subscription
  private unsubscribe: Subject<void> = new Subject();

  // Used to stop timer observable
  private stopTimer: Subject<void> = new Subject();

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Subscribe to navigation events
    this.loading$ = this.router.events.pipe(
      takeUntil(this.unsubscribe),
      filter(evt => evt instanceof NavigationStart || evt instanceof NavigationEnd || evt instanceof NavigationCancel || evt instanceof NavigationError),
      tap(evt => this.toggleTimer(evt instanceof NavigationStart)),
      map(evt => evt instanceof NavigationStart)
    );
  }

  // Start/stop a timer to simulate progress
  toggleTimer(start: boolean) {
    if (start) {
      this.stopTimer = new Subject();
      timer(0, 250).pipe(takeUntil(this.stopTimer)).subscribe(x => this.updateProgress());
    } else {
      this.progress = 0;
      this.stopTimer.next();
      this.stopTimer.complete();
    }
  }

  // Update the progress bar value
  updateProgress() {

    if (this.progress >= 0 && this.progress < 25) {
      // Start out between 3 - 6% increments
      this.progress += (Math.random() * (5 - 3 + 1) + 3);
    } else if (this.progress >= 25 && this.progress < 65) {
      // increment between 0 - 3%
      this.progress += (Math.random() * 3);
    } else if (this.progress >= 65 && this.progress < 90) {
      // increment between 0 - 2%
      this.progress += (Math.random() * 2);
    } else if (this.progress >= 90 && this.progress < 99) {
      // finally, increment it .5 %
      this.progress += 0.5;
    } else {
      // after 99%, don't increment
    }
  }
}
