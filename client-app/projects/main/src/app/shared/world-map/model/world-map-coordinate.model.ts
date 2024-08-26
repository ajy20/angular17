export interface WorldMapCoordinate {
  id: string,
  city: string,
  lat: number,
  long: number,
  color: string,
  click: () => void
}
