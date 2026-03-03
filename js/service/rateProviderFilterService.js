import { RateProvider } from "../model/RateProvider.js";
import { PROVIDER_TYPE, FILTER_PROVIDER_TYPE } from "../model/constants.js";
import { SORT_OPTIONS } from "../model/constants.js";
import { CurrencyCode } from "../model/CurrencyCode.js";

/**
 * Service for filtering and sorting rate providers
 */
export class RateProviderFilterService {
  constructor() {
    this.originalProviders = [];
  }

  setProviders(providers) {
    this.originalProviders = providers;
  }

  /**
   * Filters and sorts providers based on multiple criteria
   * @param {Object} filters - Filtering and sorting parameters
   * @param {string} [filters.providerType="all"] - Type of providers to include
   * @param {string} [filters.searchTerm=""] - Search string to filter provider names
   * @param {string} [filters.currency=""] - Currency code to filter by
   * @param {string} [filters.sortType=""] - Sorting option (best-buy-rate/best-sell-rate)
   * @returns {RateProvider[]} Filtered and sorted array of providers
   */
  filterProviders({
    providerType = "all",
    searchTerm = "",
    currency = "",
    sortType = "",
  }) {
    try {
      if (!this.originalProviders?.length) {
        return [];
      }

      let filteredProviders = [...this.originalProviders];

      if (providerType !== FILTER_PROVIDER_TYPE.ALL) {
        filteredProviders = filteredProviders.filter((provider) => {
          const currentProviderType = provider.getType();
          if (providerType === FILTER_PROVIDER_TYPE.BANKS) {
            return currentProviderType === PROVIDER_TYPE.BANK;
          } else if (providerType === FILTER_PROVIDER_TYPE.EXCHANGES) {
            return currentProviderType === PROVIDER_TYPE.EXCHANGE;
          } else if (providerType === FILTER_PROVIDER_TYPE.CRYPTO_EXCHANGES) {
            return currentProviderType === PROVIDER_TYPE.CRYPTO_EXCHANGE;
          } else if (providerType === FILTER_PROVIDER_TYPE.OTHER) {
            return currentProviderType === PROVIDER_TYPE.OTHER;
          }
        });
      }

      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredProviders = filteredProviders.filter((provider) =>
          provider.getName().toLowerCase().includes(lowerSearchTerm),
        );
      }

      if (currency && currency !== "All currencies" && currency !== "") {
        filteredProviders = filteredProviders
          .map((provider) => {
            const existingRate = provider
              .getAllRates()
              .find((rate) => rate.getForeignCurrency().getCode() === currency);
            if (!existingRate) return null;
            return new RateProvider(
              provider.getName(),
              provider.getBaseCurrency(),
              [existingRate],
              provider.getRatesDate(),
              provider.getPhoneNumber(),
              provider.getType(),
            );
          })
          .filter((provider) => provider !== null);
      }

      if (
        sortType !== SORT_OPTIONS.NO_SORT &&
        currency &&
        currency !== "All currencies" &&
        filteredProviders &&
        filteredProviders.length >= 2
      ) {
        this.sortByRate(
          filteredProviders,
          currency,
          sortType === SORT_OPTIONS.BEST_BUY ? "buy" : "sell",
        );
      }

      return filteredProviders;
    } catch (error) {
      console.error("Error in filterProviders:", error);
      return [];
    }
  }

  /**
   * Sorts provider list by specified rate type
   * @param {Array} providers - List of providers to sort
   * @param {string} currency - Currency code to use for rate comparison
   * @param {string} buyOrSell - Rate type for sorting (buy/sell)
   */
  sortByRate(providers, currency, buyOrSell) {
    providers.sort((providerA, providerB) => {
      const isMiddleA = this.isMiddleRateProvider(providerA, currency);
      const isMiddleB = this.isMiddleRateProvider(providerB, currency);

      if (isMiddleA && !isMiddleB) return 1;
      if (!isMiddleA && isMiddleB) return -1;
      if (isMiddleA && isMiddleB) return 0;

      let rateA, rateB;
      if (buyOrSell === "buy") {
        rateA = this.getBuyRate(providerA, currency);
        rateB = this.getBuyRate(providerB, currency);
        return rateB - rateA;
      } else {
        rateA = this.getSellRate(providerA, currency);
        rateB = this.getSellRate(providerB, currency);
        return rateA - rateB;
      }
    });
  }

  /**
   * Checks if provider offers a middle rate (buy rate equals sell rate)
   * @param {RateProvider} provider - Provider object
   * @param {string} currency - Currency code
   * @returns {boolean} True if buy and sell rates are equal and non-zero
   */

  isMiddleRateProvider(provider, currency) {
    const currencyCode = new CurrencyCode(currency);
    const rate = provider.getRate(currencyCode);
    if (!rate) return false;

    const buyRate = rate.getBuyRate();
    const sellRate = rate.getSellRate();

    return (
      buyRate !== undefined &&
      sellRate !== undefined &&
      buyRate === sellRate &&
      buyRate !== 0
    );
  }

  /**
   * Gets buy rate for provider and currency
   * @param {Object} provider - Provider object
   * @param {string} currency - Currency code
   * @returns {number} Buy rate or 0 if not available
   */
  getBuyRate(provider, currency) {
    const currencyCode = new CurrencyCode(currency);
    const rate = provider.getRate(currencyCode);
    return rate ? rate.getBuyRate() : 0;
  }

  /**
   * Gets sell rate for provider and currency
   * @param {Object} provider - Provider object
   * @param {string} currency - Currency code
   * @returns {number} Sell rate or 0 if not available
   */
  getSellRate(provider, currency) {
    const currencyCode = new CurrencyCode(currency);
    const rate = provider.getRate(currencyCode);
    return rate ? rate.getSellRate() : 0;
  }
}
