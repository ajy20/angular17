import { ProductStyle } from "./product-style.model";

export interface Product {
  id: string;
  name: string;
  type: { id: string, name: string };
  favourite?: boolean;
  defaultPictureUrl: string;
  styles: ProductStyle[];
}
