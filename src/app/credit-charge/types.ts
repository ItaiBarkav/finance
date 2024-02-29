import { Color } from '../services/config';

export interface Transaction {
  card: number;
  date: string;
  name: string;
  amount: number;
  type: string;
  details: string;
  debitAmount: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface ColorScheme {
  name: string;
  value: Color;
}
