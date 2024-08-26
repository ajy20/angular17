import { BaseVersionLite } from "./version-lite.model";

export interface BaseDocument {
  id: string;
  productId: string;
  parentId: string;
  name?: string;
  reference?: string;
  versionOffset: number;
  admin: boolean;
  versions: BaseVersionLite[];
  lastModifiedBy: string;
  lastModifiedOn: string;
}
