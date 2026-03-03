# RateCZ Website 
link: https://krakhman.github.io/rate-cz

A responsive website developed with JavaScript, HTML, and CSS, showcasing real-time exchange rates for banks and exchanges in Prague. This website uses the Fetch API to pull data from the kurzy.cz public API, providing users with up-to-date currency exchange rates. The app includes filters and sorting options to find the best buy/sell rates, all wrapped in a responsive, user-friendly interface.

## Project Goal

The goal of this project is to create an intuitive and reliable tool for comparing currency exchange rates across various providers in Prague, including banks, exchanges, and crypto exchanges. It aims to help users—such as travelers, investors, or locals—find the best rates for buying or selling currencies by offering real-time data, powerful filtering, and a seamless experience across desktop and mobile devices.

## Approach

The website was built using and maintainable architecture to ensure scalability and ease of development:

1. **Data Fetching**: The app leverages the Fetch API to retrieve exchange rate data from the kurzy.cz API (`https://data.kurzy.cz/json/meny/b[-1].json`). Data is cached in `localStorage` to provide partial offline functionality.
2. **Backend Logic**: JavaScript classes (`CurrencyCode`, `RateProvider`, `CurrencyRate`) handle data validation and structuring, ensuring robust processing of currency codes and rates.
3. **Filtering and Sorting**: A `RateProviderFilterService` enables filtering by provider type (banks, exchanges, crypto), currency, and search terms, with sorting options for best buy/sell rates implemented in `FilterHandler`.
4. **Frontend Design**: HTML5 provides a semantic structure, styled with CSS3 (flexbox, media queries, transitions) for a responsive and visually appealing UI. The app uses a dark theme with hover effects and smooth animations.
5. **State Management**: `FilterState` persists user preferences (currency, provider type, search term) in `localStorage` to maintain state across page reloads.
6. **Development Process**: The project was developed iteratively, starting with core data fetching, followed by filtering/sorting logic, and finalized with responsive UI design. Testing was conducted in modern browsers (Chrome, Firefox, Edge).

## Features

This website provides a comprehensive currency comparison experience:

- **Real-Time Exchange Rate Display**: Fetches and displays current exchange rates for multiple currencies (e.g., USD, EUR, GBP) from Prague-based providers, updated via the kurzy.cz API.
- **Filter for Best Rates**: Users can filter providers by:
  - **Provider Type**: Banks, exchanges, or crypto exchanges.
  - **Currency**: Select a specific currency (e.g., USD) or view all currencies.
  - **Search**: Search providers by name (e.g., "ČSOB").
- **Sort by Best Rates**: When a currency is selected, users can sort providers by the best buy or sell rates, helping identify the most cost-effective options.
- **Responsive Design**: The interface adapts to various screen sizes (desktop, tablet, mobile) using CSS media queries, ensuring usability on all devices. For example, input fields and dropdowns resize at breakpoints (1200px, 768px, 530px).
- **Persistent State**: User selections (currency, provider type, search term) are saved in `localStorage`, restoring the last state after a page reload.
- **Partial Offline Support**: Cached API data in `localStorage` allows viewing previously fetched rates when offline, though full functionality requires an internet connection.
- **Interactive UI**: Features hover effects on provider sections, smooth transitions for input focus, and a dynamic currency combobox with autocomplete-like functionality.

## Tech

- **JavaScript**:
  - Fetch API for retrieving exchange rate data.
  - ES6 classes for object-oriented structure (`CurrencyCode`, `RateProvider`, etc.).
  - `localStorage` for caching and state persistence.
  - Event-driven filtering and sorting via `FilterHandler` and `CurrencySelector`.
- **HTML**:
  - Semantic elements (`<main>`, `<footer>`) for structure.
  - Form inputs with placeholders and pattern validation.
- **CSS**:
  - Flexbox for layout (e.g., `.sorting-container`).
  - Media queries for responsive design.
  - CSS3 transitions (`transition: border-color 0.3s ease`) and transforms (`transform: translateY(-2px)`).
  - Custom properties (`--color-dark`, `--color-text-light`) for theming.
