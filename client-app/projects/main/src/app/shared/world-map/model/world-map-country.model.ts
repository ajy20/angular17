import { WorldMapContinent } from "./world-map-continent.model";

export interface WorldMapCountry {
  id: string,
  name: string,
  continent: WorldMapContinent
}
