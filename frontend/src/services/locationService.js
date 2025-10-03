import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const locationService = {
  // Validate ZIP/PIN code and get location data
  async validateZipCode(zipCode, country = 'US') {
    try {
      const response = await api.get(`/location/validate-zip/${zipCode}?country=${country}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || `Failed to validate ${country === 'IN' ? 'PIN' : 'ZIP'} code`
      );
    }
  },

  // Search cities
  async searchCities(query, state = null) {
    try {
      const params = { query };
      if (state) params.state = state;
      
      const response = await api.get('/location/search-cities', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to search cities'
      );
    }
  },

  // Get list of states for a country
  async getStates(country = 'US') {
    try {
      const response = await api.get('/location/states');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to get states'
      );
    }
  }
};

export default locationService;
