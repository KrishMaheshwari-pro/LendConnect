import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Calendar, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { locationService } from '../services/locationService';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [zipCodeValidating, setZipCodeValidating] = useState(false);
  const [zipCodeData, setZipCodeData] = useState(null);
  const [states, setStates] = useState([]);
  const { register: registerUser, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');
  const zipCode = watch('address.zipCode');

  // Load states on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const response = await locationService.getStates();
        setStates(response.states);
      } catch (error) {
        console.error('Failed to load states:', error);
      }
    };
    loadStates();
  }, []);

  const selectedCountry = watch('address.country');

  // Load states on country change
  useEffect(() => {
    const loadStates = async () => {
      try {
        const response = await locationService.getStates(selectedCountry);
        setStates(response.states);
      } catch (error) {
        console.error('Failed to load states:', error);
      }
    };
    loadStates();
  }, [selectedCountry]);

  // Validate ZIP code when it changes
  useEffect(() => {
    const validateZipCode = async () => {
      if (!zipCode) {
        setZipCodeData(null);
        return;
      }

      const minLength = selectedCountry === 'IN' ? 6 : 5;
      if (zipCode.length >= minLength) {
        setZipCodeValidating(true);
        try {
          const result = await locationService.validateZipCode(zipCode, selectedCountry);
          if (result.valid) {
            setZipCodeData(result.location);
            toast.success(`${selectedCountry === 'IN' ? 'PIN' : 'ZIP'} code validated: ${result.location.city}, ${result.location.state}`);
          } else {
            setZipCodeData(null);
            toast.error(result.message);
          }
        } catch (error) {
          setZipCodeData(null);
          toast.error(error.message);
        } finally {
          setZipCodeValidating(false);
        }
      } else {
        setZipCodeData(null);
      }
    };

    const timeoutId = setTimeout(validateZipCode, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [zipCode]);

  const onSubmit = async (data) => {
    try {
      console.log('Submitting registration form with data:', { ...data, password: '[HIDDEN]' });
      
      const formattedData = {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth).toISOString(),
        address: {
          street: data.address.street,
          city: data.address.city,
          state: data.address.state,
          zipCode: data.address.zipCode,
          country: data.address.country || 'US'
        }
      };

      console.log('Formatted registration data:', { ...formattedData, password: '[HIDDEN]' });

      const result = await registerUser(formattedData);
      console.log('Registration successful:', result);
      
      toast.success('Registration successful! Welcome to LendConnect!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join('. ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/vid.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
      <div className="max-w-2xl mx-auto relative z-20">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">LC</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-200">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters',
                      },
                    })}
                    type="text"
                    className={`input pl-10 ${errors.firstName ? 'input-error' : ''}`}
                    placeholder="Enter your first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters',
                      },
                    })}
                    type="text"
                    className={`input pl-10 ${errors.lastName ? 'input-error' : ''}`}
                    placeholder="Enter your last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: 'Invalid phone number',
                      },
                    })}
                    type="tel"
                    className={`input pl-10 ${errors.phone ? 'input-error' : ''}`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('dateOfBirth', {
                      required: 'Date of birth is required',
                    })}
                    type="date"
                    className={`input pl-10 ${errors.dateOfBirth ? 'input-error' : ''}`}
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  I want to
                </label>
                <select
                  {...register('role', {
                    required: 'Please select your role',
                  })}
                  className={`input ${errors.role ? 'input-error' : ''}`}
                >
                  <option value="">Select your role</option>
                  <option value="borrower">Borrow money</option>
                  <option value="lender">Lend money</option>
                  <option value="both">Both borrow and lend</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('address.street', {
                      required: 'Street address is required',
                    })}
                    type="text"
                    className={`input pl-10 ${errors.address?.street ? 'input-error' : ''}`}
                    placeholder="Enter your street address"
                  />
                </div>
                {errors.address?.street && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  {...register('address.city', {
                    required: 'City is required'
                  })}
                  type="text"
                  className={`input ${errors.address?.city ? 'input-error' : ''}`}
                  placeholder="Enter your city"
                  defaultValue={zipCodeData?.city || ''}
                />
                {errors.address?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  {...register('address.state', {
                    required: 'State is required',
                  })}
                  type="text"
                  className={`input ${errors.address?.state ? 'input-error' : ''}`}
                  placeholder="Enter your state"
                  defaultValue={zipCodeData?.state || ''}
                />
                {errors.address?.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <div className="relative">
                  <input
                    {...register('address.zipCode', {
                      required: `${selectedCountry === 'IN' ? 'PIN' : 'ZIP'} code is required`,
                      pattern: {
                        value: /^[0-9]{5,6}(-[0-9]{4})?$/,
                        message: 'Please enter a valid postal code',
                      },
                    })}
                    type="text"
                    className={`input pr-10 ${errors.address?.zipCode ? 'input-error' : zipCodeData ? 'border-green-500' : ''}`}
                    placeholder="Enter your ZIP code"
                  />
                  {zipCodeValidating && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Loader className="h-5 w-5 text-blue-500 animate-spin" />
                    </div>
                  )}
                  {zipCodeData && !zipCodeValidating && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="h-5 w-5 text-green-500">✓</div>
                    </div>
                  )}
                </div>
                {errors.address?.zipCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.zipCode.message}</p>
                )}
                {zipCodeData && (
                  <p className="mt-1 text-sm text-green-600">
                    ✓ {zipCodeData.city}, {zipCodeData.state}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  {...register('address.country', {
                    required: 'Country is required',
                  })}
                  className={`input ${errors.address?.country ? 'input-error' : ''}`}
                >
                  <option value="">Select a country</option>
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                </select>
                {errors.address?.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.country.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === password || 'Passwords do not match',
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`input pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('terms', {
                  required: 'You must accept the terms and conditions',
                })}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
