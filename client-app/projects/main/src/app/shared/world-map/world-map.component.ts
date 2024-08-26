import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { WorldMapContinent } from './model/world-map-continent.model';
import { WorldMapCoordinate } from './model/world-map-coordinate.model';
import { WorldMapCountry } from './model/world-map-country.model';
import { WorldMapFlow } from './model/world-map-flow.model';

const COUNTRIES: { [key: string]: WorldMapCountry } = {
  "AF": {
    "name": "Afghanistan",
    "id": "AF",
    "continent": "Asia"
  },
  "AO": {
    "name": "Angola",
    "id": "AO",
    "continent": "Africa"
  },
  "AL": {
    "name": "Albania",
    "id": "AL",
    "continent": "Europe"
  },
  "AE": {
    "name": "United Arab Emirates",
    "id": "AE",
    "continent": "Middle East"
  },
  "AR": {
    "name": "Argentina",
    "id": "AR",
    "continent": "Latin America"
  },
  "AM": {
    "name": "Armenia",
    "id": "AM",
    "continent": "Middle East"
  },
  "AU": {
    "name": "Australia",
    "id": "AU",
    "continent": "Oceania"
  },
  "AT": {
    "name": "Austria",
    "id": "AT",
    "continent": "Europe"
  },
  "AZ": {
    "name": "Azerbaijan",
    "id": "AZ",
    "continent": "Middle East"
  },
  "BI": {
    "name": "Burundi",
    "id": "BI",
    "continent": "Africa"
  },
  "BE": {
    "name": "Belgium",
    "id": "BE",
    "continent": "Europe"
  },
  "BJ": {
    "name": "Benin",
    "id": "BJ",
    "continent": "Africa"
  },
  "BF": {
    "name": "Burkina Faso",
    "id": "BF",
    "continent": "Africa"
  },
  "BD": {
    "name": "Bangladesh",
    "id": "BD",
    "continent": "Asia"
  },
  "BG": {
    "name": "Bulgaria",
    "id": "BG",
    "continent": "Europe"
  },
  "BA": {
    "name": "Bosnia and Herz.",
    "id": "BA",
    "continent": "Europe"
  },
  "BY": {
    "name": "Belarus",
    "id": "BY",
    "continent": "Europe"
  },
  "BZ": {
    "name": "Belize",
    "id": "BZ",
    "continent": "Latin America"
  },
  "BO": {
    "name": "Bolivia",
    "id": "BO",
    "continent": "Latin America"
  },
  "BR": {
    "name": "Brazil",
    "id": "BR",
    "continent": "Latin America"
  },
  "BN": {
    "name": "Brunei",
    "id": "BN",
    "continent": "Asia"
  },
  "BT": {
    "name": "Bhutan",
    "id": "BT",
    "continent": "Asia"
  },
  "BW": {
    "name": "Botswana",
    "id": "BW",
    "continent": "Africa"
  },
  "CF": {
    "name": "Central African Rep.",
    "id": "CF",
    "continent": "Africa"
  },
  "CA": {
    "name": "Canada",
    "id": "CA",
    "continent": "North America"
  },
  "CH": {
    "name": "Switzerland",
    "id": "CH",
    "continent": "Europe"
  },
  "CL": {
    "name": "Chile",
    "id": "CL",
    "continent": "Latin America"
  },
  "CN": {
    "name": "China",
    "id": "CN",
    "continent": "Asia"
  },
  "CI": {
    "name": "Côte d'Ivoire",
    "id": "CI",
    "continent": "Africa"
  },
  "CM": {
    "name": "Cameroon",
    "id": "CM",
    "continent": "Africa"
  },
  "CD": {
    "name": "Dem. Rep. Congo",
    "id": "CD",
    "continent": "Africa"
  },
  "CG": {
    "name": "Congo",
    "id": "CG",
    "continent": "Africa"
  },
  "CO": {
    "name": "Colombia",
    "id": "CO",
    "continent": "Latin America"
  },
  "CR": {
    "name": "Costa Rica",
    "id": "CR",
    "continent": "Latin America"
  },
  "CU": {
    "name": "Cuba",
    "id": "CU",
    "continent": "Latin America"
  },
  "CZ": {
    "name": "Czech Rep.",
    "id": "CZ",
    "continent": "Europe"
  },
  "DE": {
    "name": "Germany",
    "id": "DE",
    "continent": "Europe"
  },
  "DJ": {
    "name": "Djibouti",
    "id": "DJ",
    "continent": "Africa"
  },
  "DK": {
    "name": "Denmark",
    "id": "DK",
    "continent": "Europe"
  },
  "DO": {
    "name": "Dominican Rep.",
    "id": "DO",
    "continent": "Latin America"
  },
  "DZ": {
    "name": "Algeria",
    "id": "DZ",
    "continent": "Africa"
  },
  "EC": {
    "name": "Ecuador",
    "id": "EC",
    "continent": "Latin America"
  },
  "EG": {
    "name": "Egypt",
    "id": "EG",
    "continent": "Africa"
  },
  "ER": {
    "name": "Eritrea",
    "id": "ER",
    "continent": "Africa"
  },
  "EE": {
    "name": "Estonia",
    "id": "EE",
    "continent": "Europe"
  },
  "ET": {
    "name": "Ethiopia",
    "id": "ET",
    "continent": "Africa"
  },
  "FI": {
    "name": "Finland",
    "id": "FI",
    "continent": "Europe"
  },
  "FJ": {
    "name": "Fiji",
    "id": "FJ",
    "continent": "Oceania"
  },
  "GA": {
    "name": "Gabon",
    "id": "GA",
    "continent": "Africa"
  },
  "GB": {
    "name": "United Kingdom",
    "id": "GB",
    "continent": "Europe"
  },
  "GE": {
    "name": "Georgia",
    "id": "GE",
    "continent": "Middle East"
  },
  "GH": {
    "name": "Ghana",
    "id": "GH",
    "continent": "Africa"
  },
  "GN": {
    "name": "Guinea",
    "id": "GN",
    "continent": "Africa"
  },
  "GM": {
    "name": "Gambia",
    "id": "GM",
    "continent": "Africa"
  },
  "GW": {
    "name": "Guinea-Bissau",
    "id": "GW",
    "continent": "Africa"
  },
  "GQ": {
    "name": "Eq. Guinea",
    "id": "GQ",
    "continent": "Africa"
  },
  "GR": {
    "name": "Greece",
    "id": "GR",
    "continent": "Europe"
  },
  "GL": {
    "name": "Greenland",
    "id": "GL",
    "continent": "Europe"
  },
  "GT": {
    "name": "Guatemala",
    "id": "GT",
    "continent": "Latin America"
  },
  "GY": {
    "name": "Guyana",
    "id": "GY",
    "continent": "Latin America"
  },
  "HN": {
    "name": "Honduras",
    "id": "HN",
    "continent": "Latin America"
  },
  "HR": {
    "name": "Croatia",
    "id": "HR",
    "continent": "Europe"
  },
  "HT": {
    "name": "Haiti",
    "id": "HT",
    "continent": "Latin America"
  },
  "HU": {
    "name": "Hungary",
    "id": "HU",
    "continent": "Europe"
  },
  "ID": {
    "name": "Indonesia",
    "id": "ID",
    "continent": "Asia"
  },
  "IN": {
    "name": "India",
    "id": "IN",
    "continent": "Asia"
  },
  "IE": {
    "name": "Ireland",
    "id": "IE",
    "continent": "Europe"
  },
  "IR": {
    "name": "Iran",
    "id": "IR",
    "continent": "Middle East"
  },
  "IQ": {
    "name": "Iraq",
    "id": "IQ",
    "continent": "Middle East"
  },
  "IS": {
    "name": "Iceland",
    "id": "IS",
    "continent": "Europe"
  },
  "IL": {
    "name": "Israel",
    "id": "IL",
    "continent": "Middle East"
  },
  "IT": {
    "name": "Italy",
    "id": "IT",
    "continent": "Europe"
  },
  "JM": {
    "name": "Jamaica",
    "id": "JM",
    "continent": "Latin America"
  },
  "JO": {
    "name": "Jordan",
    "id": "JO",
    "continent": "Middle East"
  },
  "JP": {
    "name": "Japan",
    "id": "JP",
    "continent": "Asia"
  },
  "KZ": {
    "name": "Kazakhstan",
    "id": "KZ",
    "continent": "Asia"
  },
  "KE": {
    "name": "Kenya",
    "id": "KE",
    "continent": "Africa"
  },
  "KG": {
    "name": "Kyrgyzstan",
    "id": "KG",
    "continent": "Asia"
  },
  "KH": {
    "name": "Cambodia",
    "id": "KH",
    "continent": "Asia"
  },
  "KR": {
    "name": "Korea",
    "id": "KR",
    "continent": "Asia"
  },
  "KW": {
    "name": "Kuwait",
    "id": "KW",
    "continent": "Middle East"
  },
  "LA": {
    "name": "Lao PDR",
    "id": "LA",
    "continent": "Asia"
  },
  "LB": {
    "name": "Lebanon",
    "id": "LB",
    "continent": "Middle East"
  },
  "LR": {
    "name": "Liberia",
    "id": "LR",
    "continent": "Africa"
  },
  "LY": {
    "name": "Libya",
    "id": "LY",
    "continent": "Africa"
  },
  "LK": {
    "name": "Sri Lanka",
    "id": "LK",
    "continent": "Asia"
  },
  "LS": {
    "name": "Lesotho",
    "id": "LS",
    "continent": "Africa"
  },
  "LT": {
    "name": "Lithuania",
    "id": "LT",
    "continent": "Europe"
  },
  "LU": {
    "name": "Luxembourg",
    "id": "LU",
    "continent": "Europe"
  },
  "LV": {
    "name": "Latvia",
    "id": "LV",
    "continent": "Europe"
  },
  "MA": {
    "name": "Morocco",
    "id": "MA",
    "continent": "Africa"
  },
  "MD": {
    "name": "Moldova",
    "id": "MD",
    "continent": "Europe"
  },
  "MG": {
    "name": "Madagascar",
    "id": "MG",
    "continent": "Africa"
  },
  "MX": {
    "name": "Mexico",
    "id": "MX",
    "continent": "Latin America"
  },
  "MK": {
    "name": "Macedonia",
    "id": "MK",
    "continent": "Europe"
  },
  "ML": {
    "name": "Mali",
    "id": "ML",
    "continent": "Africa"
  },
  "MM": {
    "name": "Myanmar",
    "id": "MM",
    "continent": "Asia"
  },
  "ME": {
    "name": "Montenegro",
    "id": "ME",
    "continent": "Europe"
  },
  "MN": {
    "name": "Mongolia",
    "id": "MN",
    "continent": "Asia"
  },
  "MZ": {
    "name": "Mozambique",
    "id": "MZ",
    "continent": "Africa"
  },
  "MR": {
    "name": "Mauritania",
    "id": "MR",
    "continent": "Africa"
  },
  "MW": {
    "name": "Malawi",
    "id": "MW",
    "continent": "Africa"
  },
  "MY": {
    "name": "Malaysia",
    "id": "MY",
    "continent": "Asia"
  },
  "NA": {
    "name": "Namibia",
    "id": "NA",
    "continent": "Africa"
  },
  "NE": {
    "name": "Niger",
    "id": "NE",
    "continent": "Africa"
  },
  "NG": {
    "name": "Nigeria",
    "id": "NG",
    "continent": "Africa"
  },
  "NI": {
    "name": "Nicaragua",
    "id": "NI",
    "continent": "Latin America"
  },
  "NL": {
    "name": "Netherlands",
    "id": "NL",
    "continent": "Europe"
  },
  "NO": {
    "name": "Norway",
    "id": "NO",
    "continent": "Europe"
  },
  "NP": {
    "name": "Nepal",
    "id": "NP",
    "continent": "Asia"
  },
  "NZ": {
    "name": "New Zealand",
    "id": "NZ",
    "continent": "Oceania"
  },
  "OM": {
    "name": "Oman",
    "id": "OM",
    "continent": "Middle East"
  },
  "PK": {
    "name": "Pakistan",
    "id": "PK",
    "continent": "Asia"
  },
  "PA": {
    "name": "Panama",
    "id": "PA",
    "continent": "Latin America"
  },
  "PE": {
    "name": "Peru",
    "id": "PE",
    "continent": "Latin America"
  },
  "PH": {
    "name": "Philippines",
    "id": "PH",
    "continent": "Asia"
  },
  "PG": {
    "name": "Papua New Guinea",
    "id": "PG",
    "continent": "Asia"
  },
  "PL": {
    "name": "Poland",
    "id": "PL",
    "continent": "Europe"
  },
  "KP": {
    "name": "Dem. Rep. Korea",
    "id": "KP",
    "continent": "Asia"
  },
  "PT": {
    "name": "Portugal",
    "id": "PT",
    "continent": "Europe"
  },
  "PY": {
    "name": "Paraguay",
    "id": "PY",
    "continent": "Latin America"
  },
  "PS": {
    "name": "Palestine",
    "id": "PS",
    "continent": "Middle East"
  },
  "QA": {
    "name": "Qatar",
    "id": "QA",
    "continent": "Middle East"
  },
  "RO": {
    "name": "Romania",
    "id": "RO",
    "continent": "Europe"
  },
  "RU": {
    "name": "Russia",
    "id": "RU",
    "continent": "Europe"
  },
  "RW": {
    "name": "Rwanda",
    "id": "RW",
    "continent": "Africa"
  },
  "EH": {
    "name": "W. Sahara",
    "id": "EH",
    "continent": "Africa"
  },
  "SA": {
    "name": "Saudi Arabia",
    "id": "SA",
    "continent": "Middle East"
  },
  "SD": {
    "name": "Sudan",
    "id": "SD",
    "continent": "Africa"
  },
  "SS": {
    "name": "S. Sudan",
    "id": "SS",
    "continent": "Africa"
  },
  "SN": {
    "name": "Senegal",
    "id": "SN",
    "continent": "Africa"
  },
  "SL": {
    "name": "Sierra Leone",
    "id": "SL",
    "continent": "Africa"
  },
  "SV": {
    "name": "El Salvador",
    "id": "SV",
    "continent": "Latin America"
  },
  "RS": {
    "name": "Serbia",
    "id": "RS",
    "continent": "Europe"
  },
  "SR": {
    "name": "Suriname",
    "id": "SR",
    "continent": "Latin America"
  },
  "SK": {
    "name": "Slovakia",
    "id": "SK",
    "continent": "Europe"
  },
  "SI": {
    "name": "Slovenia",
    "id": "SI",
    "continent": "Europe"
  },
  "SE": {
    "name": "Sweden",
    "id": "SE",
    "continent": "Europe"
  },
  "SZ": {
    "name": "Swaziland",
    "id": "SZ",
    "continent": "Africa"
  },
  "SY": {
    "name": "Syria",
    "id": "SY",
    "continent": "Middle East"
  },
  "TD": {
    "name": "Chad",
    "id": "TD",
    "continent": "Africa"
  },
  "TG": {
    "name": "Togo",
    "id": "TG",
    "continent": "Africa"
  },
  "TH": {
    "name": "Thailand",
    "id": "TH",
    "continent": "Asia"
  },
  "TJ": {
    "name": "Tajikistan",
    "id": "TJ",
    "continent": "Asia"
  },
  "TM": {
    "name": "Turkmenistan",
    "id": "TM",
    "continent": "Asia"
  },
  "TL": {
    "name": "Timor-Leste",
    "id": "TL",
    "continent": "Asia"
  },
  "TN": {
    "name": "Tunisia",
    "id": "TN",
    "continent": "Africa"
  },
  "TR": {
    "name": "Turkey",
    "id": "TR",
    "continent": "Middle East"
  },
  "TW": {
    "name": "Taiwan",
    "id": "TW",
    "continent": "Asia"
  },
  "TZ": {
    "name": "Tanzania",
    "id": "TZ",
    "continent": "Africa"
  },
  "UG": {
    "name": "Uganda",
    "id": "UG",
    "continent": "Africa"
  },
  "UA": {
    "name": "Ukraine",
    "id": "UA",
    "continent": "Europe"
  },
  "UY": {
    "name": "Uruguay",
    "id": "UY",
    "continent": "Latin America"
  },
  "US": {
    "name": "United States",
    "id": "US",
    "continent": "North America"
  },
  "UZ": {
    "name": "Uzbekistan",
    "id": "UZ",
    "continent": "Asia"
  },
  "VE": {
    "name": "Venezuela",
    "id": "VE",
    "continent": "Latin America"
  },
  "VN": {
    "name": "Vietnam",
    "id": "VN",
    "continent": "Asia"
  },
  "VU": {
    "name": "Vanuatu",
    "id": "VU",
    "continent": "Oceania"
  },
  "YE": {
    "name": "Yemen",
    "id": "YE",
    "continent": "Middle East"
  },
  "ZA": {
    "name": "South Africa",
    "id": "ZA",
    "continent": "Africa"
  },
  "ZM": {
    "name": "Zambia",
    "id": "ZM",
    "continent": "Africa"
  },
  "ZW": {
    "name": "Zimbabwe",
    "id": "ZW",
    "continent": "Africa"
  },
  "SO": {
    "name": "Somalia",
    "id": "SO",
    "continent": "Africa"
  },
  "GF": {
    "name": "French Guiana",
    "id": "GF",
    "continent": "Latin America"
  },
  "FR": {
    "name": "France",
    "id": "FR",
    "continent": "Europe"
  },
  "ES": {
    "name": "Spain",
    "id": "ES",
    "continent": "Europe"
  },
  "AW": {
    "name": "Aruba",
    "id": "AW",
    "continent": "Latin America"
  },
  "AI": {
    "name": "Anguilla",
    "id": "AI",
    "continent": "Latin America"
  },
  "AD": {
    "name": "Andorra",
    "id": "AD",
    "continent": "Europe"
  },
  "AG": {
    "name": "Antigua and Barb.",
    "id": "AG",
    "continent": "Latin America"
  },
  "BS": {
    "name": "Bahamas",
    "id": "BS",
    "continent": "Latin America"
  },
  "BM": {
    "name": "Bermuda",
    "id": "BM",
    "continent": "Latin America"
  },
  "BB": {
    "name": "Barbados",
    "id": "BB",
    "continent": "Latin America"
  },
  "KM": {
    "name": "Comoros",
    "id": "KM",
    "continent": "Africa"
  },
  "CV": {
    "name": "Cape Verde",
    "id": "CV",
    "continent": "Africa"
  },
  "KY": {
    "name": "Cayman Is.",
    "id": "KY",
    "continent": "Africa"
  },
  "DM": {
    "name": "Dominica",
    "id": "DM",
    "continent": "Latin America"
  },
  "FK": {
    "name": "Falkland Is.",
    "id": "FK",
    "continent": "Latin America"
  },
  "FO": {
    "name": "Faeroe Is.",
    "id": "FO",
    "continent": "Latin America"
  },
  "GD": {
    "name": "Grenada",
    "id": "GD",
    "continent": "Latin America"
  },
  "HK": {
    "name": "Hong Kong",
    "id": "HK",
    "continent": "Asia"
  },
  "KN": {
    "name": "St. Kitts and Nevis",
    "id": "KN",
    "continent": "Oceania"
  },
  "LC": {
    "name": "Saint Lucia",
    "id": "LC",
    "continent": "Oceania"
  },
  "LI": {
    "name": "Liechtenstein",
    "id": "LI",
    "continent": "Europe"
  },
  "MV": {
    "name": "Maldives",
    "id": "MV",
    "continent": "Asia"
  },
  "MT": {
    "name": "Malta",
    "id": "MT",
    "continent": "Europe"
  },
  "MS": {
    "name": "Montserrat",
    "id": "MS",
    "continent": "Europe"
  },
  "MU": {
    "name": "Mauritius",
    "id": "MU",
    "continent": "Africa"
  },
  "NC": {
    "name": "New Caledonia",
    "id": "NC",
    "continent": "Oceania"
  },
  "NR": {
    "name": "Nauru",
    "id": "NR",
    "continent": "Latin America"
  },
  "PN": {
    "name": "Pitcairn Is.",
    "id": "PN",
    "continent": "Latin America"
  },
  "PR": {
    "name": "Puerto Rico",
    "id": "PR",
    "continent": "Latin America"
  },
  "PF": {
    "name": "Fr. Polynesia",
    "id": "PF",
    "continent": "Oceania"
  },
  "SG": {
    "name": "Singapore",
    "id": "SG",
    "continent": "Asia"
  },
  "SB": {
    "name": "Solomon Is.",
    "id": "SB",
    "continent": "Oceania"
  },
  "ST": {
    "name": "São Tomé and Principe",
    "id": "ST",
    "continent": "Latin America"
  },
  "SX": {
    "name": "Sint Maarten",
    "id": "SX",
    "continent": "Latin America"
  },
  "SC": {
    "name": "Seychelles",
    "id": "SC",
    "continent": "Asia"
  },
  "TC": {
    "name": "Turks and Caicos Is.",
    "id": "TC",
    "continent": "Oceania"
  },
  "TO": {
    "name": "Tonga",
    "id": "TO",
    "continent": "Oceania"
  },
  "TT": {
    "name": "Trinidad and Tobago",
    "id": "TT",
    "continent": "Latin America"
  },
  "VC": {
    "name": "St. Vin. and Gren.",
    "id": "VC",
    "continent": "Latin America"
  },
  "VG": {
    "name": "British Virgin Is.",
    "id": "VG",
    "continent": "Latin America"
  },
  "VI": {
    "name": "U.S. Virgin Is.",
    "id": "VI",
    "continent": "Latin America"
  },
  "CY": {
    "name": "Cyprus",
    "id": "CY",
    "continent": "Europe"
  },
  "RE": {
    "name": "Reunion",
    "id": "RE",
    "continent": "Asia"
  },
  "YT": {
    "name": "Mayotte",
    "id": "YT",
    "continent": "Oceania"
  },
  "MQ": {
    "name": "Martinique",
    "id": "MQ",
    "continent": "Latin America"
  },
  "GP": {
    "name": "Guadeloupe",
    "id": "GP",
    "continent": "Latin America"
  },
  "CW": {
    "name": "Curaco",
    "id": "CW",
    "continent": "Latin America"
  },
  "IC": {
    "name": "Canary Islands",
    "id": "IC",
    "continent": "Africa"
  }
}

@Component({
  selector: 'csps-world-map',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './world-map.component.html',
  styleUrl: './world-map.component.scss'
})
export class WorldMapComponent implements OnChanges, AfterViewInit {
  @ViewChild('map', { read: ElementRef }) map!: ElementRef;

  @Input() locationMarkerSize: number = 7;

  // The coordinates for the points to show on the map
  @Input() coordinates!: WorldMapCoordinate[];

  // The flows to show on the map
  @Input() flows!: WorldMapFlow[];

  // The selected regions
  @Input() selectedContinents!: Map<WorldMapContinent, { color: string }>;

  // The computed locations for the points to show on the map
  locations!: {
    point: { x: number, y: number },
    id: string,
    city: string,
    lat: number,
    long: number,
    color: string,
    click: (loc: any) => void
  }[];

  // The computed coordinates for the arrows to show on the map
  arrows!: {
    from: { x: number, y: number },
    to: { x: number, y: number },
    id: string,
    sourceId: string,
    destinationId: string,
    color: string,
    click: (arr: any) => void
  }[];

  private viewInitialized: boolean = false;

  constructor(private elRef: ElementRef) { }

  ngAfterViewInit() {
    this.drawLocationsAndArrows();
    this.selectCountries();
    this.viewInitialized = true;
  }

  ngOnChanges() {
    if (this.viewInitialized) {
      this.drawLocationsAndArrows();
      this.selectCountries();
    }
  }

  drawLocationsAndArrows() {
    const mapWidth = 2000;
    const mapHeight = 1001;
    //const fx = -33;
    //const fy = -59;

    const fx = -26;
    const fy = -66;

    if (this.coordinates?.length)
      this.locations = this.coordinates.map(x => ({
        ...x,
        point: this.Robinson(mapWidth, mapHeight, fx, fy)(x.lat, x.long)
      }));

    if (this.flows?.length)
      this.arrows = this.flows.map(x => {
        const fromLocation = this.locations.find(y => y.id === x.sourceId);
        const toLocation = this.locations.find(y => y.id === x.destinationId);

        return {
          ...x,
          from: fromLocation !== undefined ? { x: fromLocation.point.x, y: fromLocation.point.y } : { x: 0, y: 0 },
          to: toLocation !== undefined ? { x: toLocation.point.x, y: toLocation.point.y } : { x: 0, y: 0 }
        };
      });
  }

  selectCountries(): void {
    Object.values(COUNTRIES)
      .forEach(c => {
        const cont = this.selectedContinents?.get(c.continent);
        if (cont)
          this.map.nativeElement.querySelector('#' + c.id)?.setAttribute('fill', cont.color)
        else
          this.map.nativeElement.querySelector('#' + c.id)?.setAttribute('fill', '#f2f2f2')
      });
  }

  // Map is a Robinson projection
  // Need to convert longitude and lattitude into coordinates

  Robinson = function (mapWidth: number, mapHeight: number, fudgeX: number, fudgeY: number) {
    // map width and height are asked for because they are what the
    // earthRadius value relies upon. You can use either, as long as
    // the image is sized such that width = height*1.97165551906973 
    // you can use either to do the calculation, but as of now I
    // require both and only use width. both are used in projectToCSS.
    const earthRadius = (mapWidth / 2.666269758) / 2;

    // fudgeX, fudgeY are used to offset points, this is to calibrate
    // the points if they aren't showing up in the right place exactly 
    fudgeX = (typeof fudgeX === 'undefined') ? 0 : fudgeX;
    fudgeY = (typeof fudgeY === 'undefined') ? 0 : fudgeY;

    // these tables are created by robinson and are what the projection is based upon
    const AA = [0.8487, 0.84751182, 0.84479598, 0.840213, 0.83359314, 0.8257851, 0.814752, 0.80006949, 0.78216192, 0.76060494, 0.73658673, 0.7086645, 0.67777182, 0.64475739, 0.60987582, 0.57134484, 0.52729731, 0.48562614, 0.45167814];
    const BB = [0, 0.0838426, 0.1676852, 0.2515278, 0.3353704, 0.419213, 0.5030556, 0.5868982, 0.67182264, 0.75336633, 0.83518048, 0.91537187, 0.99339958, 1.06872269, 1.14066505, 1.20841528, 1.27035062, 1.31998003, 1.3523];


    const project = function (lat: number, lng: number) {
      // returns the robinson projected point for a given lat/lng based on
      // the earth radius value determined in the contructor

      var roundToNearest = function (roundTo: number, value: number) {
        return Math.floor(value / roundTo) * roundTo;  //rounds down
      };
      var getSign = function (value: number) {
        return value < 0 ? -1 : 1;
      };

      var lngSign = getSign(lng), latSign = getSign(lat); //deals with negatives
      lng = Math.abs(lng); lat = Math.abs(lat); //all calculations positive
      var radian = 0.017453293; //pi/180
      var low = roundToNearest(5, lat - 0.0000000001); //want exact numbers to round down
      low = (lat == 0) ? 0 : low; //except when at 0
      var high = low + 5;

      // indicies used for interpolation
      var lowIndex = low / 5;
      var highIndex = high / 5;
      var ratio = (lat - low) / 5;

      // interpolation in one dimension
      var adjAA = ((AA[highIndex] - AA[lowIndex]) * ratio) + AA[lowIndex];
      var adjBB = ((BB[highIndex] - BB[lowIndex]) * ratio) + BB[lowIndex];

      //create point from robinson function
      var point = {
        x: (adjAA * lng * radian * lngSign * earthRadius) + fudgeX,
        y: (adjBB * latSign * earthRadius) + fudgeY
      };

      return point;

    };

    return function (lat: number, lng: number): { x: number, y: number } {
      // changes the coordinate system of a projected point to the one CSS uses
      var point = project(lat, lng);
      point.x = (point.x + (mapWidth / 2));
      point.y = ((mapHeight / 2) - point.y);
      return point;
    };
  };
}
