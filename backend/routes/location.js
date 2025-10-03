const express = require('express');
const axios = require('axios');

const router = express.Router();

// ZIP/PIN code validation patterns
const POSTAL_CODE_PATTERN = /^[0-9]{5,6}(-[0-9]{4})?$/;

/**
 * @route   GET /api/location/validate-zip/:zipCode
 * @desc    Validate ZIP code and return location data
 * @access  Public
 */
router.get('/validate-zip/:zipCode', async (req, res) => {
  try {
    const { zipCode } = req.params;
    const { country = 'US' } = req.query;
    
    // Basic format validation
    if (!POSTAL_CODE_PATTERN.test(zipCode)) {
      return res.status(400).json({
        valid: false,
        message: 'Please enter a valid postal code'
      });
    }

    // Try to get location data, but don't require it
    try {
      const countryCode = country === 'IN' ? 'in' : 'us';
      const response = await axios.get(`http://api.zippopotam.us/${countryCode}/${zipCode}`);
      const data = response.data;
      
      if (data && data.places && data.places.length > 0) {
        const place = data.places[0];
        return res.json({
          valid: true,
          location: {
            city: place['place name'],
            state: place['state'],
            stateAbbreviation: place['state abbreviation'],
            country: 'US',
            zipCode: data['post code'],
            latitude: place['latitude'],
            longitude: place['longitude']
          }
        });
      } else {
        return res.status(404).json({
          valid: false,
          message: 'ZIP code not found'
        });
      }
    } catch (apiError) {
      // Allow any valid format postal code
      return res.json({
        valid: true,
        location: {
          city: '',
          state: '',
          stateAbbreviation: '',
          country: country,
          zipCode: zipCode,
          latitude: null,
          longitude: null
        },
        message: 'Postal code format is valid'
      });
    }
  } catch (error) {
    console.error('ZIP code validation error:', error);
    res.status(500).json({
      valid: false,
      message: 'Error validating ZIP code'
    });
  }
});

/**
 * @route   GET /api/location/search-cities
 * @desc    Search cities by name
 * @access  Public
 */
router.get('/search-cities', async (req, res) => {
  try {
    const { query, state } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        message: 'Search query must be at least 2 characters long'
      });
    }

    // This is a simplified implementation
    // In a real app, you'd use a proper geocoding service like Google Maps API
    const commonCities = [
      // Indian Cities
      { name: 'Mumbai', state: 'MH', country: 'IN' },
      { name: 'Delhi', state: 'DL', country: 'IN' },
      { name: 'Bangalore', state: 'KA', country: 'IN' },
      { name: 'Hyderabad', state: 'TS', country: 'IN' },
      { name: 'Chennai', state: 'TN', country: 'IN' },
      { name: 'Kolkata', state: 'WB', country: 'IN' },
      { name: 'Pune', state: 'MH', country: 'IN' },
      { name: 'Ahmedabad', state: 'GJ', country: 'IN' },
      { name: 'Jaipur', state: 'RJ', country: 'IN' },
      { name: 'Lucknow', state: 'UP', country: 'IN' },
      // US Cities
      { name: 'New York', state: 'NY', country: 'US' },
      { name: 'Los Angeles', state: 'CA', country: 'US' },
      { name: 'Chicago', state: 'IL', country: 'US' },
      { name: 'Houston', state: 'TX', country: 'US' },
      { name: 'Phoenix', state: 'AZ', country: 'US' },
      { name: 'Philadelphia', state: 'PA', country: 'US' },
      { name: 'San Antonio', state: 'TX', country: 'US' },
      { name: 'San Diego', state: 'CA', country: 'US' },
      { name: 'Dallas', state: 'TX', country: 'US' },
      { name: 'San Jose', state: 'CA', country: 'US' },
      { name: 'Austin', state: 'TX', country: 'US' },
      { name: 'Jacksonville', state: 'FL', country: 'US' },
      { name: 'Fort Worth', state: 'TX', country: 'US' },
      { name: 'Columbus', state: 'OH', country: 'US' },
      { name: 'Charlotte', state: 'NC', country: 'US' },
      { name: 'San Francisco', state: 'CA', country: 'US' },
      { name: 'Indianapolis', state: 'IN', country: 'US' },
      { name: 'Seattle', state: 'WA', country: 'US' },
      { name: 'Denver', state: 'CO', country: 'US' },
      { name: 'Washington', state: 'DC', country: 'US' }
    ];

    let filteredCities = commonCities.filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase())
    );

    if (state) {
      filteredCities = filteredCities.filter(city => 
        city.state.toLowerCase() === state.toLowerCase()
      );
    }

    res.json({
      cities: filteredCities.slice(0, 10) // Limit to 10 results
    });
  } catch (error) {
    console.error('City search error:', error);
    res.status(500).json({
      message: 'Error searching cities'
    });
  }
});

/**
 * @route   GET /api/location/states
 * @desc    Get list of US states
 * @access  Public
 */
router.get('/states', (req, res) => {
  const { country = 'US' } = req.query;
  
  const indianStates = [
    { code: 'AP', name: 'Andhra Pradesh' },
    { code: 'AR', name: 'Arunachal Pradesh' },
    { code: 'AS', name: 'Assam' },
    { code: 'BR', name: 'Bihar' },
    { code: 'CG', name: 'Chhattisgarh' },
    { code: 'GA', name: 'Goa' },
    { code: 'GJ', name: 'Gujarat' },
    { code: 'HR', name: 'Haryana' },
    { code: 'HP', name: 'Himachal Pradesh' },
    { code: 'JH', name: 'Jharkhand' },
    { code: 'KA', name: 'Karnataka' },
    { code: 'KL', name: 'Kerala' },
    { code: 'MP', name: 'Madhya Pradesh' },
    { code: 'MH', name: 'Maharashtra' },
    { code: 'MN', name: 'Manipur' },
    { code: 'ML', name: 'Meghalaya' },
    { code: 'MZ', name: 'Mizoram' },
    { code: 'NL', name: 'Nagaland' },
    { code: 'OR', name: 'Odisha' },
    { code: 'PB', name: 'Punjab' },
    { code: 'RJ', name: 'Rajasthan' },
    { code: 'SK', name: 'Sikkim' },
    { code: 'TN', name: 'Tamil Nadu' },
    { code: 'TS', name: 'Telangana' },
    { code: 'TR', name: 'Tripura' },
    { code: 'UK', name: 'Uttarakhand' },
    { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'WB', name: 'West Bengal' },
    { code: 'AN', name: 'Andaman and Nicobar Islands' },
    { code: 'CH', name: 'Chandigarh' },
    { code: 'DN', name: 'Dadra and Nagar Haveli' },
    { code: 'DD', name: 'Daman and Diu' },
    { code: 'DL', name: 'Delhi' },
    { code: 'JK', name: 'Jammu and Kashmir' },
    { code: 'LA', name: 'Ladakh' },
    { code: 'LD', name: 'Lakshadweep' },
    { code: 'PY', name: 'Puducherry' }
  ];

  const usStates = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' }
  ];

  const states = country === 'IN' ? indianStates : usStates;
  res.json({ states });
});

module.exports = router;
