/**
 * Tests for locationService.js
 *
 * Tests the Google Places API integration with free tier quota protection.
 * Verifies error handling and graceful degradation when quota is exceeded.
 */

describe('locationService', () => {
  beforeEach(() => {
    // Reset window.google before each test
    delete window.google;
    jest.resetModules();
  });

  describe('isPlacesAPIAvailable', () => {
    test('returns true if Google Places API is loaded', () => {
      window.google = {
        maps: {
          places: {
            AutocompleteService: jest.fn()
          }
        }
      };
      const { isPlacesAPIAvailable } = require('./locationService');
      expect(isPlacesAPIAvailable()).toBe(true);
    });

    test('returns false if Google Places API is not loaded', () => {
      delete window.google;
      jest.resetModules();
      const { isPlacesAPIAvailable } = require('./locationService');
      expect(isPlacesAPIAvailable()).toBe(false);
    });

    test('returns false if google.maps is missing', () => {
      window.google = {};
      jest.resetModules();
      const { isPlacesAPIAvailable } = require('./locationService');
      expect(isPlacesAPIAvailable()).toBe(false);
    });

    test('returns false if google.maps.places is missing', () => {
      window.google = { maps: {} };
      jest.resetModules();
      const { isPlacesAPIAvailable } = require('./locationService');
      expect(isPlacesAPIAvailable()).toBe(false);
    });
  });

  describe('searchPlaces', () => {
    beforeEach(() => {
      window.google = {
        maps: {
          places: {
            AutocompleteService: jest.fn(() => ({
              getPlacePredictions: jest.fn()
            }))
          }
        }
      };
    });

    test('throws APIError if API not available', async () => {
      delete window.google;
      jest.resetModules();
      const { searchPlaces, APIError } = require('./locationService');

      await expect(searchPlaces('test')).rejects.toThrow(APIError);
    });

    test('returns empty array for empty query', async () => {
      const { searchPlaces } = require('./locationService');
      const results = await searchPlaces('');
      expect(results).toEqual([]);
    });

    test('returns empty array for whitespace-only query', async () => {
      const { searchPlaces } = require('./locationService');
      const results = await searchPlaces('   ');
      expect(results).toEqual([]);
    });

    test('returns empty array for single character query', async () => {
      const { searchPlaces } = require('./locationService');
      const results = await searchPlaces('a');
      expect(results).toEqual([]);
    });

    test('returns empty array for null query', async () => {
      const { searchPlaces } = require('./locationService');
      const results = await searchPlaces(null);
      expect(results).toEqual([]);
    });

    test('throws QuotaExceededError on OVER_QUERY_LIMIT', async () => {
      const mockGetPlacePredictions = jest.fn().mockResolvedValue({
        status: 'OVER_QUERY_LIMIT',
        predictions: []
      });
      window.google.maps.places.AutocompleteService = jest.fn(() => ({
        getPlacePredictions: mockGetPlacePredictions
      }));
      jest.resetModules();
      const { searchPlaces, QuotaExceededError } = require('./locationService');

      await expect(searchPlaces('Mountain View')).rejects.toThrow(QuotaExceededError);
    });

    test('throws APIError on other API status errors', async () => {
      const mockGetPlacePredictions = jest.fn().mockResolvedValue({
        status: 'REQUEST_DENIED',
        predictions: []
      });
      window.google.maps.places.AutocompleteService = jest.fn(() => ({
        getPlacePredictions: mockGetPlacePredictions
      }));
      jest.resetModules();
      const { searchPlaces, APIError } = require('./locationService');

      await expect(searchPlaces('test')).rejects.toThrow(APIError);
    });

    test('returns predictions on OK status', async () => {
      const mockPredictions = [
        {
          place_id: 'place1',
          main_text: 'Mountain View',
          secondary_text: 'CA, USA'
        }
      ];
      const mockGetPlacePredictions = jest.fn().mockResolvedValue({
        status: 'OK',
        predictions: mockPredictions
      });
      window.google.maps.places.AutocompleteService = jest.fn(() => ({
        getPlacePredictions: mockGetPlacePredictions
      }));
      jest.resetModules();
      const { searchPlaces } = require('./locationService');

      const results = await searchPlaces('Mountain View');
      expect(results).toEqual(mockPredictions);
    });

    test('returns predictions on ZERO_RESULTS status', async () => {
      const mockGetPlacePredictions = jest.fn().mockResolvedValue({
        status: 'ZERO_RESULTS',
        predictions: []
      });
      window.google.maps.places.AutocompleteService = jest.fn(() => ({
        getPlacePredictions: mockGetPlacePredictions
      }));
      jest.resetModules();
      const { searchPlaces } = require('./locationService');

      const results = await searchPlaces('xyz123nonsense');
      expect(results).toEqual([]);
    });

    test('calls AutocompleteService with correct request format', async () => {
      const mockGetPlacePredictions = jest.fn().mockResolvedValue({
        status: 'OK',
        predictions: []
      });
      const mockService = {
        getPlacePredictions: mockGetPlacePredictions
      };
      window.google.maps.places.AutocompleteService = jest.fn(() => mockService);
      jest.resetModules();
      const { searchPlaces } = require('./locationService');

      await searchPlaces('Paris');
      expect(mockGetPlacePredictions).toHaveBeenCalledWith({ input: 'Paris' });
    });

    test('wraps network errors in APIError', async () => {
      const mockGetPlacePredictions = jest.fn().mockRejectedValue(
        new Error('Network error')
      );
      window.google.maps.places.AutocompleteService = jest.fn(() => ({
        getPlacePredictions: mockGetPlacePredictions
      }));
      jest.resetModules();
      const { searchPlaces, APIError } = require('./locationService');

      await expect(searchPlaces('test')).rejects.toThrow(APIError);
    });
  });

  describe('getPlaceDetails', () => {
    beforeEach(() => {
      window.google = {
        maps: {
          places: {
            AutocompleteService: jest.fn(),
            PlacesService: jest.fn()
          }
        }
      };
      // Mock document.createElement
      document.createElement = jest.fn(() => ({}));
    });

    test('throws APIError if API not available', async () => {
      delete window.google;
      jest.resetModules();
      const { getPlaceDetails, APIError } = require('./locationService');

      await expect(getPlaceDetails('place1')).rejects.toThrow(APIError);
    });

    test('throws APIError if placeId is empty', async () => {
      const { getPlaceDetails, APIError } = require('./locationService');
      await expect(getPlaceDetails('')).rejects.toThrow(APIError);
    });

    test('throws APIError if placeId is null', async () => {
      const { getPlaceDetails, APIError } = require('./locationService');
      await expect(getPlaceDetails(null)).rejects.toThrow(APIError);
    });

    test('throws QuotaExceededError on OVER_QUERY_LIMIT status', async () => {
      let capturedCallback;
      const mockGetDetails = jest.fn((request, callback) => {
        capturedCallback = callback;
      });

      window.google.maps.places.PlacesService = jest.fn(() => ({
        getDetails: mockGetDetails
      }));
      const { getPlaceDetails, QuotaExceededError } = require('./locationService');

      const promise = getPlaceDetails('place1');
      // Simulate API callback with quota error
      if (capturedCallback) {
        capturedCallback(null, 'OVER_QUERY_LIMIT');
      }

      await expect(promise).rejects.toThrow(QuotaExceededError);
    });

    test('throws APIError on other status errors', async () => {
      let capturedCallback;
      const mockGetDetails = jest.fn((request, callback) => {
        capturedCallback = callback;
      });

      window.google.maps.places.PlacesService = jest.fn(() => ({
        getDetails: mockGetDetails
      }));
      const { getPlaceDetails, APIError } = require('./locationService');

      const promise = getPlaceDetails('place1');
      if (capturedCallback) {
        capturedCallback(null, 'ZERO_RESULTS');
      }

      await expect(promise).rejects.toThrow(APIError);
    });

    test('throws APIError when place is null', async () => {
      let capturedCallback;
      const mockGetDetails = jest.fn((request, callback) => {
        capturedCallback = callback;
      });

      window.google.maps.places.PlacesService = jest.fn(() => ({
        getDetails: mockGetDetails
      }));
      const { getPlaceDetails, APIError } = require('./locationService');

      const promise = getPlaceDetails('place1');
      if (capturedCallback) {
        capturedCallback(null, 'OK');
      }

      await expect(promise).rejects.toThrow(APIError);
    });

    test('returns structured place details on success', async () => {
      let capturedCallback;
      const mockGetDetails = jest.fn((request, callback) => {
        capturedCallback = callback;
      });

      const mockPlace = {
        place_id: 'place1',
        formatted_address: '123 Main St, San Francisco, CA 94102, USA',
        name: 'Test Location',
        address_components: [
          { types: ['route'], long_name: '123 Main St' },
          { types: ['locality'], long_name: 'San Francisco' },
          { types: ['postal_code'], long_name: '94102' },
          { types: ['country'], long_name: 'United States' }
        ],
        geometry: {
          location: {
            lat: () => 37.7749,
            lng: () => -122.4194
          }
        },
        types: ['point_of_interest']
      };

      window.google.maps.places.PlacesService = jest.fn(() => ({
        getDetails: mockGetDetails
      }));
      const { getPlaceDetails } = require('./locationService');

      const promise = getPlaceDetails('place1');
      if (capturedCallback) {
        capturedCallback(mockPlace, 'OK');
      }

      const result = await promise;
      expect(result).toEqual({
        placeId: 'place1',
        formattedAddress: '123 Main St, San Francisco, CA 94102, USA',
        name: 'Test Location',
        country: 'United States',
        city: 'San Francisco',
        street: '123 Main St',
        postalCode: '94102',
        lat: 37.7749,
        lng: -122.4194,
        types: ['point_of_interest']
      });
    });

    test('handles missing address components gracefully', async () => {
      let capturedCallback;
      const mockGetDetails = jest.fn((request, callback) => {
        capturedCallback = callback;
      });

      const mockPlace = {
        place_id: 'place2',
        formatted_address: 'Some address',
        name: 'Test',
        address_components: [],
        geometry: {
          location: {
            lat: () => 0,
            lng: () => 0
          }
        },
        types: []
      };

      window.google.maps.places.PlacesService = jest.fn(() => ({
        getDetails: mockGetDetails
      }));
      const { getPlaceDetails } = require('./locationService');

      const promise = getPlaceDetails('place2');
      if (capturedCallback) {
        capturedCallback(mockPlace, 'OK');
      }

      const result = await promise;
      expect(result.country).toBe('');
      expect(result.city).toBe('');
      expect(result.street).toBe('');
      expect(result.postalCode).toBe('');
    });

    test('requests correct fields from PlacesService', async () => {
      const mockGetDetails = jest.fn((request, callback) => {
        callback(null, 'OK');
      });

      window.google.maps.places.PlacesService = jest.fn(() => ({
        getDetails: mockGetDetails
      }));
      const { getPlaceDetails, APIError } = require('./locationService');

      try {
        await getPlaceDetails('place1');
      } catch (e) {
        // Expected to throw APIError
        expect(e instanceof APIError).toBe(true);
      }

      // Verify the request was made with correct fields
      expect(mockGetDetails).toHaveBeenCalledTimes(1);
      const callArgs = mockGetDetails.mock.calls[0][0];
      expect(callArgs.placeId).toBe('place1');
      expect(callArgs.fields).toEqual([
        'formatted_address',
        'geometry',
        'address_components',
        'name',
        'types',
        'place_id'
      ]);
    });

    test('wraps unexpected errors in APIError', async () => {
      window.google.maps.places.PlacesService = jest.fn(() => {
        throw new Error('Service initialization failed');
      });
      const { getPlaceDetails, APIError } = require('./locationService');

      await expect(getPlaceDetails('place1')).rejects.toThrow(APIError);
    });
  });

  describe('parseManualLocation', () => {
    let parseManualLocation;

    beforeEach(() => {
      jest.resetModules();
      const module = require('./locationService');
      parseManualLocation = module.parseManualLocation;
    });

    test('returns null for empty string', () => {
      const result = parseManualLocation('');
      expect(result).toBeNull();
    });

    test('returns null for whitespace-only string', () => {
      const result = parseManualLocation('   ');
      expect(result).toBeNull();
    });

    test('returns null for null input', () => {
      const result = parseManualLocation(null);
      expect(result).toBeNull();
    });

    test('returns null for undefined input', () => {
      const result = parseManualLocation(undefined);
      expect(result).toBeNull();
    });

    test('returns structured location object for valid text', () => {
      const result = parseManualLocation('Paris, France');
      expect(result).toEqual({
        formattedAddress: 'Paris, France',
        name: null,
        placeId: null,
        lat: null,
        lng: null,
        country: null,
        city: null,
        street: null,
        postalCode: null,
        types: []
      });
    });

    test('trims whitespace from input', () => {
      const result = parseManualLocation('  Tokyo, Japan  ');
      expect(result.formattedAddress).toBe('Tokyo, Japan');
    });

    test('preserves internal spaces', () => {
      const result = parseManualLocation('New York City');
      expect(result.formattedAddress).toBe('New York City');
    });

    test('returns location with all null/empty fields except formattedAddress', () => {
      const result = parseManualLocation('Custom location');
      expect(result.placeId).toBeNull();
      expect(result.lat).toBeNull();
      expect(result.lng).toBeNull();
      expect(result.country).toBeNull();
      expect(result.city).toBeNull();
      expect(result.street).toBeNull();
      expect(result.postalCode).toBeNull();
      expect(result.types).toEqual([]);
    });
  });

  describe('Custom Error Classes', () => {
    let QuotaExceededError, APIError;

    beforeEach(() => {
      jest.resetModules();
      const module = require('./locationService');
      QuotaExceededError = module.QuotaExceededError;
      APIError = module.APIError;
    });

    test('QuotaExceededError has correct name and message', () => {
      const error = new QuotaExceededError('Custom message');
      expect(error.name).toBe('QuotaExceededError');
      expect(error.message).toBe('Custom message');
      expect(error instanceof Error).toBe(true);
    });

    test('QuotaExceededError uses default message', () => {
      const error = new QuotaExceededError();
      expect(error.message).toBe('Google Places API quota exceeded');
    });

    test('APIError has correct name and message', () => {
      const error = new APIError('Custom error');
      expect(error.name).toBe('APIError');
      expect(error.message).toBe('Custom error');
      expect(error instanceof Error).toBe(true);
    });

    test('APIError uses default message', () => {
      const error = new APIError();
      expect(error.message).toBe('Google Places API error');
    });

    test('errors can be caught with instanceof', () => {
      const quotaError = new QuotaExceededError();
      const apiError = new APIError();

      expect(quotaError instanceof QuotaExceededError).toBe(true);
      expect(apiError instanceof APIError).toBe(true);
      expect(quotaError instanceof APIError).toBe(false);
    });
  });

  describe('Integration: Error handling flow', () => {
    beforeEach(() => {
      // Set up window.google fresh for integration tests
      window.google = {
        maps: {
          places: {
            AutocompleteService: jest.fn(),
            PlacesService: jest.fn()
          }
        }
      };
    });

    test('searchPlaces propagates QuotaExceededError unchanged', async () => {
      const mockGetPlacePredictions = jest.fn().mockResolvedValue({
        status: 'OVER_QUERY_LIMIT'
      });
      window.google.maps.places.AutocompleteService = jest.fn(() => ({
        getPlacePredictions: mockGetPlacePredictions
      }));

      const { searchPlaces } = require('./locationService');
      await expect(searchPlaces('query')).rejects.toThrow('Google Places API quota exceeded');
    });

    test('getPlaceDetails propagates QuotaExceededError unchanged', async () => {
      const mockGetDetails = jest.fn((request, callback) => {
        // Invoke callback with OVER_QUERY_LIMIT status asynchronously
        setTimeout(() => callback(null, 'OVER_QUERY_LIMIT'), 0);
      });

      window.google.maps.places.PlacesService = jest.fn(() => ({
        getDetails: mockGetDetails
      }));

      const { getPlaceDetails } = require('./locationService');
      await expect(getPlaceDetails('place1')).rejects.toThrow('Google Places API quota exceeded');
    });
  });
});
