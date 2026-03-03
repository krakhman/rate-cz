import { CurrencyCode } from "../model/CurrencyCode.js";
import { CurrencyRate } from "../model/CurrencyRate.js";
import { RateProvider } from "../model/RateProvider.js";
import { phoneNumberData } from "../../sources/config/phoneNumberData.js";
import { API_URL } from "../../sources/config/apiConfig.js";
import { bankNames } from "../../sources/config/bankNames.js";

// Fetches rates from API with fallback to cached data
async function fetchAllProviderRatesData() {
  if (!navigator.onLine) {
    console.log("No internet connection detected. Using cached data.");
    return loadDataFromLocalStorage();
  }

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      mode: "cors",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status}, Status Text: ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0 || !data[0].kurzy) {
      throw new Error(
        "Invalid API response structure: Expected an array with 'kurzy' properties",
      );
    }

    localStorage.setItem("apiData", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Fetch failed:", {
      message: error.message,
      stack: error.stack,
      url: API_URL,
    });
    console.log("Falling back to cached data due to fetch error.");
    return loadDataFromLocalStorage();
  }
}

// Loads cached rates from localStorage
function loadDataFromLocalStorage() {
  const storedData = localStorage.getItem("apiData");
  if (storedData) {
    return JSON.parse(storedData);
  }
  return null;
}

/**
 * Converts raw rate data to CurrencyRate objects
 * @param {Object} kurzy - Raw rate data from API
 * @param {boolean} isCNB - Flag for Czech National Bank special handling
 * @returns {CurrencyRate[]} Array of valid currency rates
 */
function createRates(kurzy, isCNB) {
  return Object.entries(kurzy)
    .map(([currency, rateData]) => {
      const currencyCode = CurrencyCode.create(currency);
      if (!currencyCode) return null;

      if (isCNB) {
        const middleRate = rateData.dev_stred;
        if (middleRate === null || middleRate === undefined) return null;
        return new CurrencyRate(
          currencyCode,
          parseFloat(middleRate),
          parseFloat(middleRate),
        );
      }

      const buyRate =
        rateData.dev_nakup !== null && rateData.dev_nakup !== undefined
          ? parseFloat(rateData.dev_nakup)
          : rateData.val_nakup !== null && rateData.val_nakup !== undefined
            ? parseFloat(rateData.val_nakup)
            : null;

      const sellRate =
        rateData.dev_prodej !== null && rateData.dev_prodej !== undefined
          ? parseFloat(rateData.dev_prodej)
          : rateData.val_prodej !== null && rateData.val_prodej !== undefined
            ? parseFloat(rateData.val_prodej)
            : null;

      if (buyRate === null || sellRate === null) return null;
      return new CurrencyRate(currencyCode, buyRate, sellRate);
    })
    .filter((rate) => rate !== null);
}

/**
 * Creates a RateProvider instance
 * @param {string} name - Provider name
 * @param {CurrencyRate[]} rates - Array of currency rates
 * @param {string} date - Rate date string
 * @param {string|null} phoneNumber - Provider contact number
 * @param {string} type - Provider type (from PROVIDER_TYPE)
 * @returns {RateProvider} New provider instance
 */
function createProvider(name, rates, date, phoneNumber, type) {
  return new RateProvider(
    name,
    new CurrencyCode("CZK"),
    rates,
    date,
    phoneNumber,
    type,
  );
}

/**
 * Finds phone number for provider
 * @param {string} providerName - Name to search for
 * @param {Array} phoneData - Phone number dataset
 * @returns {string|null} Phone number if found
 */
function getPhoneNumber(providerName, phoneData) {
  const provider = phoneData.find((p) => p.name === providerName);
  return provider ? provider.phoneNumber : null;
}

/**
 * Processes raw provider API data
 * @param {Object} data - Raw provider data from API
 * @returns {RateProvider|null} Processed provider or null if invalid
 */
function processProviderData(data) {
  if (!data || !data.kurzy) {
    console.warn("Invalid provider data received");
    return null;
  }

  try {
    if (
      data.banka === "Turecká centrální banka" ||
      data.banka === "Poštovní spořitelna" ||
      data.banka === "Prepocet EURa" ||
      data.banka === "Exchange"
    ) {
      return null;
    }
    const type = bankNames.includes(data.banka)
      ? PROVIDER_TYPE.BANK
      : exchangeNames.includes(data.banka)
        ? PROVIDER_TYPE.EXCHANGE
        : PROVIDER_TYPE.OTHER;
    const isCNB = data.banka === "Česká národní banka";
    const rates = createRates(data.kurzy, isCNB);

    if (rates.length === 0) {
      return null;
    }

    const phoneNumber = getPhoneNumber(data.banka, phoneNumberData);
    return createProvider(data.banka, rates, data.denc, phoneNumber, type);
  } catch (error) {
    console.error(`Error processing provider ${data.banka}:`, error);
    return null;
  }
}

// Main function: fetches and processes all provider rates
export async function fetchAndProcessAllProviderRates() {
  try {
    const allProviderData = await fetchAllProviderRatesData();
    const providerDataArray = Array.isArray(allProviderData)
      ? allProviderData
      : [allProviderData];

    const providers = providerDataArray
      .map((providerData) => processProviderData(providerData))
      .filter((provider) => provider !== null);

    return providers;
  } catch (error) {
    console.error("Error fetching provider rates:", error);
    return [];
  }
}
