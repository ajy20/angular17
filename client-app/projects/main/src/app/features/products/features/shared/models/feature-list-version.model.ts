import { BaseVersion } from '../../../shared/components/version-page-template/models/base-version.model';
import { ProductFeatureListTableFeature } from '../product-feature-list-table/model/product-feature-list-table-feature.model';

export interface FeatureListVersion extends BaseVersion {
  features: ProductFeatureListTableFeature[];
  canReleaseWithRestrictions: boolean;
}
