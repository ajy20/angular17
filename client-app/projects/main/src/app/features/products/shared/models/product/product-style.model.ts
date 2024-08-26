import { ProductModLevel } from "./product-mod-level.model";

export interface ProductStyle {
  id: string;
  name: string;
  modLevels: ProductModLevel[];
}
