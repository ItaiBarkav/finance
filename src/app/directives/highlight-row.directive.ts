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
      if (this.name().includes('פז')) {
        this.el.nativeElement.style.backgroundColor = 'yellow';
      }
    });
  }
}
