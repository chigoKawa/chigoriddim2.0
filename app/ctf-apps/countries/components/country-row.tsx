import React from 'react';
import { Country } from '../types';
import { FLAG_CDN_BASE } from '../constants';

interface Props {
  country: Country;
  showCurrency: boolean;
}

export default function CountryRow({ country, showCurrency }: Props) {
  const flagUrl = `${FLAG_CDN_BASE}/${country.code.toLowerCase()}.svg`;
  return (
    <div className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-100">
      <img src={flagUrl} alt={`${country.name} flag`} className="w-6 h-4 object-cover" />
      <div className="flex-1">
        <div className="font-medium">{country.name}</div>
        <div className="text-sm text-gray-500">{country.code}</div>
      </div>
      {showCurrency && (
        <div className="text-sm">
          {country.currency.symbol} ({country.currency.code})
        </div>
      )}
    </div>
  );
}
