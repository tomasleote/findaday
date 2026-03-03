/**
 * Location Service
 *
 * Isolates all Google Places API logic and implements free tier quota protection.
 * When quota is exceeded, the service throws QuotaExceededError so consuming
 * components can gracefully degrade to manual text input.
 *
 * Exported Functions:
 * - isPlacesAPIAvailable() - Check if Google Places API is loaded
 * - searchPlaces(query) - Autocomplete with quota detection
 * - getPlaceDetails(placeId) - Fetch structured location data
 * - parseManualLocation(text) - Handle manual text fallback
 *
 * Exported Error Classes:
 * - QuotaExceededError - Thrown when API quota is exceeded
 * - APIError - Thrown for other API failures
 */

/**
 * Custom error for when Google Places API quota is exceeded.
 * Enables consuming components to gracefully degrade to manual input.
 *
 * @class QuotaExceededError
 * @extends Error
 */
export class QuotaExceededError extends Error {
  /**
   * Create a QuotaExceededError
   *
   * @param {string} message - Error message (optional)
   */
  constructor(message = 'Google Places API quota exceeded') {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

/**
 * Custom error for general API failures.
 *
 * @class APIError
 * @extends Error
 */
export class APIError extends Error {
  /**
   * Create an APIError
   *
   * @param {string} message - Error message (optional)
   */
  constructor(message = 'Google Places API error') {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Check if Google Places API is available.
 * Returns true only if the full API hierarchy is accessible.
 *
 * @returns {boolean} True if API is loaded and accessible
 */
export const isPlacesAPIAvailable = () => {
  return !!(window.google?.maps?.places?.AutocompleteService);
};

/**
 * Search for places using Google Places Autocomplete API.
 *
 * @param {string} query - Search query (requires >= 2 characters)
 * @returns {Promise<Array>} Array of place predictions
 * @throws {QuotaExceededError} If API quota exceeded
 * @throws {APIError} If API is unavailable or returns error status
 *
 * @example
 * try {
 *   const predictions = await searchPlaces('San Francisco');
 *   console.log(predictions); // [{ place_id, main_text, secondary_text }, ...]
 * } catch (error) {
 *   if (error instanceof QuotaExceededError) {
 *     // Show fallback: manual text input
 *   }
 * }
 */
export const searchPlaces = async (query) => {
  // Verify API is available
  if (!isPlacesAPIAvailable()) {
    throw new APIError('Google Places API not loaded');
  }

  // Validate query length (minimum 2 characters)
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    // Create AutocompleteService instance
    const service = new window.google.maps.places.AutocompleteService();
    const request = { input: query };

    // Call getPlacePredictions
    const response = await service.getPlacePredictions(request);

    // Check for quota exceeded (most critical case)
    if (response.status === 'OVER_QUERY_LIMIT') {
      throw new QuotaExceededError();
    }

    // Allow OK and ZERO_RESULTS, reject others
    if (response.status && response.status !== 'OK' && response.status !== 'ZERO_RESULTS') {
      throw new APIError(`Google API error: ${response.status}`);
    }

    // Return predictions array (empty if ZERO_RESULTS)
    return response.predictions || [];
  } catch (error) {
    // Re-throw our custom errors as-is
    if (error instanceof QuotaExceededError) {
      throw error;
    }
    if (error instanceof APIError) {
      throw error;
    }
    // Wrap unexpected errors
    throw new APIError(error.message);
  }
};

/**
 * Get detailed place information.
 * Extracts address components and coordinates.
 *
 * @param {string} placeId - Google Places ID (required)
 * @returns {Promise<Object>} Structured place details
 * @throws {QuotaExceededError} If API quota exceeded
 * @throws {APIError} If API is unavailable or returns error status
 *
 * @example
 * const details = await getPlaceDetails('place_id_here');
 * // Returns: {
 * //   placeId, formattedAddress, name,
 * //   country, city, street, postalCode,
 * //   lat, lng, types
 * // }
 */
export const getPlaceDetails = async (placeId) => {
  // Verify API is available
  if (!isPlacesAPIAvailable()) {
    throw new APIError('Google Places API not loaded');
  }

  // Validate placeId
  if (!placeId) {
    throw new APIError('Place ID is required');
  }

  try {
    // Create PlacesService instance (requires a div, but we don't use it)
    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    // Wrap callback-based API in a Promise
    return new Promise((resolve, reject) => {
      service.getDetails(
        {
          placeId,
          fields: [
            'formatted_address',
            'geometry',
            'address_components',
            'name',
            'types',
            'place_id'
          ]
        },
        (place, status) => {
          // Check for quota exceeded first (most critical)
          if (status === 'OVER_QUERY_LIMIT') {
            reject(new QuotaExceededError());
            return;
          }

          // Check for other error statuses
          if (status !== 'OK') {
            reject(new APIError(`Google API error: ${status}`));
            return;
          }

          // Verify we got a place object
          if (!place) {
            reject(new APIError('No place details returned'));
            return;
          }

          // Extract address components with fallbacks to empty string
          const components = place.address_components || [];
          const locality = components.find(
            c => c.types.includes('locality')
          )?.long_name || '';
          const country = components.find(
            c => c.types.includes('country')
          )?.long_name || '';
          const postal = components.find(
            c => c.types.includes('postal_code')
          )?.long_name || '';
          const route = components.find(
            c => c.types.includes('route')
          )?.long_name || '';

          // Return structured location object
          resolve({
            placeId: place.place_id,
            formattedAddress: place.formatted_address,
            name: place.name,
            country,
            city: locality,
            street: route,
            postalCode: postal,
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng(),
            types: place.types || []
          });
        }
      );
    });
  } catch (error) {
    // Re-throw our custom errors as-is
    if (error instanceof QuotaExceededError || error instanceof APIError) {
      throw error;
    }
    // Wrap unexpected errors
    throw new APIError(error.message);
  }
};

/**
 * Parse location object from user-entered text.
 * Used as fallback when Google Places API is unavailable or quota exceeded.
 * Returns a minimal location object with only formattedAddress set.
 *
 * @param {string} text - User-entered location text
 * @returns {Object|null} Minimal location object, or null if text is empty/invalid
 *
 * @example
 * const location = parseManualLocation('Paris, France');
 * // Returns: {
 * //   formattedAddress: 'Paris, France',
 * //   name: null,
 * //   placeId: null,
 * //   lat: null,
 * //   lng: null,
 * //   country: null,
 * //   city: null,
 * //   street: null,
 * //   postalCode: null,
 * //   types: []
 * // }
 */
export const parseManualLocation = (text) => {
  // Return null for empty, null, undefined, or whitespace-only input
  if (!text || !text.trim()) {
    return null;
  }

  // Return location object with minimal info (only formattedAddress)
  return {
    formattedAddress: text.trim(),
    name: null,
    placeId: null,
    lat: null,
    lng: null,
    country: null,
    city: null,
    street: null,
    postalCode: null,
    types: []
  };
};
