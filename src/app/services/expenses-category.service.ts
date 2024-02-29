import { Injectable } from '@angular/core';
import { Color, FOOD, FUEL, HVR, INSURANCE } from './config';

@Injectable({
  providedIn: 'root',
})
export class ExpensesCategoryService {
  getColor(name: string): string {
    let color = '';

    if (FUEL.some((fuel) => name.includes(fuel))) {
      color = Color['FUEL'];
    } else if (HVR.some((hvr) => name.includes(hvr))) {
      color = Color['HVR'];
    } else if (FOOD.some((food) => name.includes(food))) {
      color = Color['FOOD'];
    } else if (INSURANCE.some((insurance) => name.includes(insurance))) {
      color = Color['INSURANCE'];
    } else {
      color = Color['OTHER'];
    }

    return color;
  }

  getCategory(name: string): string {
    let category = '';

    if (FUEL.some((fuel) => name.includes(fuel))) {
      category = this.getKeyByValue(Color.FUEL);
    } else if (HVR.some((hvr) => name.includes(hvr))) {
      category = this.getKeyByValue(Color.HVR);
    } else if (FOOD.some((food) => name.includes(food))) {
      category = this.getKeyByValue(Color.FOOD);
    } else if (INSURANCE.some((insurance) => name.includes(insurance))) {
      category = this.getKeyByValue(Color.INSURANCE);
    } else {
      category = this.getKeyByValue(Color.OTHER);
    }

    return category;
  }

  private getKeyByValue(value: string): string {
    return (Object.keys(Color) as (keyof typeof Color)[]).find(
      (key) => Color[key] === value
    )!;
  }
}
