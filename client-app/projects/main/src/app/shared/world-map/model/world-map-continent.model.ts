const continents = ['Europe', 'North America', 'Latin America', 'Africa', 'Middle East', 'Asia' , 'Oceania'] as const;
export type WorldMapContinent = typeof continents[number];
