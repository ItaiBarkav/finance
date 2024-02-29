import { Injectable } from '@angular/core';
import { CATEGORIES, Color } from './config';

@Injectable({
  providedIn: 'root',
})
export class ExpensesCategoryService {
  getColor(name: string): string {
    let color = '';

    CATEGORIES.forEach((category) => {
      if (category.value.some((word) => name.includes(word))) {
        color = this.getColorValue(category.key);
      }
    });

    if (color === '') {
      color = Color['OTHER'];
    }

    return color;
  }

  getCategory(name: string): string {
    let categoryByName = '';

    CATEGORIES.forEach((category) => {
      if (category.value.some((word) => name.includes(word))) {
        categoryByName = category.key;
      }
    });

    if (categoryByName === '') {
      categoryByName = this.getKeyByValue(Color.OTHER);
    }

    return categoryByName;
  }

  private getKeyByValue(value: string): string {
    return (Object.keys(Color) as (keyof typeof Color)[]).find(
      (key) => Color[key] === value
    )!;
  }

  private getColorValue(category: string): Color {
    let color: Color;

    Object.entries(Color).map(([key, value]) => {
      if (category === key) {
        color = value;
      }
    });

    return color!;
  }
}
