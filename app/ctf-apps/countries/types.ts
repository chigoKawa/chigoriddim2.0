export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  status: 'active' | 'disabled';
  currency: Currency;
}

export interface State {
  name: string;
  code: string;
  country: string; // reference Country code
}
