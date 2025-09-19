// Service to fetch exchange rates from the API
export interface ExchangeRateResponse {
  result: string;
  provider: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  time_eol_unix: number;
  base_code: string;
  rates: {
    [key: string]: number;
  };
}

export const fetchUSDToHNL = async (): Promise<number> => {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ExchangeRateResponse = await response.json();
    
    if (data.result !== 'success') {
      throw new Error('API returned unsuccessful result');
    }
    
    const hnlRate = data.rates.HNL;
    
    if (!hnlRate) {
      throw new Error('HNL rate not found in response');
    }
    
    return hnlRate;
  } catch (error) {
    console.error('Error fetching USD to HNL rate:', error);
    throw error;
  }
};
