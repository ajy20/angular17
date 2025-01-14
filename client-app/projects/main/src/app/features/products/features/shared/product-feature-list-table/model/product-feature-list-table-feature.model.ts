import { ProductFeatureListTableArraySize } from "./product-feature-list-table-array-size.model";
import { ProductFeatureListTableCategory } from "./product-feature-list-table-category.model";
import { ProductFeatureListTableOption } from "./product-feature-list-table-option.model";

export interface ProductFeatureListTableFeature {
  id: string;
  category: ProductFeatureListTableCategory;
  name: string;
  description: string;
  rank: string;
  dimensionId?: string;
  isNumeric?: boolean;
  isFreeText?: boolean;
  options: ProductFeatureListTableOption[];
  styleRestrictions?: string[];
  notes?: string;
  isArray?: boolean;
  arraySize?: ProductFeatureListTableArraySize;
  isAutoGenerated?: boolean;
}
