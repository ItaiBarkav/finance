import { Directive, ElementRef, Input, effect, signal } from '@angular/core';
import { Transaction } from '../credit-charge/types';

@Directive({
  selector: '[appHighlightRow]',
  standalone: true,
})
export class HighlightRowDirective {
  @Input() set rowData(transaction: Transaction) {
    this.name.set(transaction.name);
  }

  name = signal('');

  constructor(private el: ElementRef) {
    effect(() => {
      if (
        this.name().includes('פז') ||
        this.name().includes('תפוז') ||
        this.name().includes('אלון')
      ) {
        this.el.nativeElement.style.backgroundColor = '#fcaa1f';
      } else if (this.name().includes('חבר')) {
        this.el.nativeElement.style.backgroundColor = '#8fd7f3';
      } else if (this.name().includes('הראל') || this.name().includes('הפול')) {
        this.el.nativeElement.style.backgroundColor = '#79c870';
      } else if (
        this.name().includes('פיצה') ||
        this.name().includes('חומוס')
      ) {
        this.el.nativeElement.style.backgroundColor = '#d40f8c';
      }
    });
  }
}
