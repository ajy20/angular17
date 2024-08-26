import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Colors } from './model/colors.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Expose the color from the app CSS
  colors: Colors = {
    'blue': '',
    'indigo': '',
    'purple': '',
    'pink': '',
    'red': '',
    'orange': '',
    'yellow': '',
    'green': '',
    'teal': '',
    'cyan': '',
    'white': '',
    'gray': '',
    'gray-dark': '',
    'primary': '',
    'secondary': '',
    'success': '',
    'info': '',
    'warning': '',
    'danger': '',
    'light': '',
    'dark': ''
  }

  // Expose a palette
  palette: string[] = [];

  constructor(@Inject(DOCUMENT) private document: Document) {
    const bodyStyles = getComputedStyle(document.body);

    Object.keys(this.colors).forEach(k => {
      this.colors[k as keyof Colors] = bodyStyles.getPropertyValue('--bs-' + k).trim();
    });

    this.palette = [
      this.colors.blue,
      this.colors.cyan,
      this.colors.teal,
      this.colors.green,
      this.colors.yellow,
      this.colors.gray,
      this.colors['gray-dark']
    ]
  }
}
