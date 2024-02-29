import { Directive, ElementRef, Input, effect, signal } from '@angular/core';
import { Transaction } from '../credit-charge/types';
import { ExpensesCategoryService } from '../services/expenses-category.service';

@Directive({
  selector: '[appHighlightRow]',
  standalone: true,
})
export class HighlightRowDirective {
  @Input() set rowData(transaction: Transaction) {
    this.name.set(transaction.name);
  }

  name = signal('');

  constructor(
    private el: ElementRef,
    private expensesCategoryService: ExpensesCategoryService
  ) {
    effect(() => {
      this.el.nativeElement.style.backgroundColor =
        this.expensesCategoryService.getColor(this.name());
    });
  }
}
