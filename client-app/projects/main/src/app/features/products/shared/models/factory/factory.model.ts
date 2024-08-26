import { Mrp } from "./mrp.model";

export interface Factory {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  latitude: number;
  longitude: number;
  mrpSystem: Mrp;
  sapCode ?: string;
  labOfficeCode ?: string;
  favourite ?: boolean;
  showErpTemplate ?: boolean;
}
