import { Precision } from "./precision.model";

export interface Uom {
  symbol: string;
  numerator: number;
  denominator: number;
  constant: number;
  inverse: boolean;
  precision: Precision;
}

