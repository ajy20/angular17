import { Feature } from "./feature.model";

export interface Epic {
  id: string;
  name: string;
  features: Feature[];
}
