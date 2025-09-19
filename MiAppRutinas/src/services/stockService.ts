import axios from "axios";

const API_KEY = "f4e7b52239mshfdfed5467834de2p175391jsnd3e5479b94d0"; 
const API_HOST = "yahoo-finance15.p.rapidapi.com";

export const getStockData = async (symbol: string) => {
  try {
    const options = {
      method: "GET",
      url: `https://${API_HOST}/api/v1/markets/quote/${symbol}`,
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST,
      },
    };

    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error en getStockData:", error);
    return null;
  }
};
