import { Uom } from "./uom.model";

export interface Dimension {
  id: string;
  name: string;
  metric: Uom;
  english: Uom;
}

