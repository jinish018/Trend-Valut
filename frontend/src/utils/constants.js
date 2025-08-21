// Application constants

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'DejaVu NFT',
  version: import.meta.env.VITE_VERSION || '1.0.0',
  description: 'Your comprehensive cryptocurrency tracking platform',
};

export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  COINGECKO_BASE: 'https://api.coingecko.com/api/v3',
};

export const CHART_PERIODS = [
  { value: 1, label: '24H', shortLabel: '1D' },
  { value: 7, label: '7 Days', shortLabel: '7D' },
  { value: 30, label: '30 Days', shortLabel: '30D' },
  { value: 90, label: '90 Days', shortLabel: '90D' },
  { value: 365, label: '1 Year', shortLabel: '1Y' },
];

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  BTC: '₿',
  ETH: 'Ξ',
};

export const MARKET_CAP_RANKS = {
  LARGE_CAP: { min: 1, max: 10, label: 'Large Cap' },
  MID_CAP: { min: 11, max: 50, label: 'Mid Cap' },
  SMALL_CAP: { min: 51, max: 200, label: 'Small Cap' },
  MICRO_CAP: { min: 201, max: 1000, label: 'Micro Cap' },
  NANO_CAP: { min: 1001, max: Infinity, label: 'Nano Cap' },
};

export const PRICE_CHANGE_THRESHOLDS = {
  EXTREME_GAIN: 20,
  HIGH_GAIN: 10,
  MODERATE_GAIN: 5,
  SMALL_GAIN: 1,
  NEUTRAL: 0,
  SMALL_LOSS: -1,
  MODERATE_LOSS: -5,
  HIGH_LOSS: -10,
  EXTREME_LOSS: -20,
};

export const PORTFOLIO_ACTIONS = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
  VIEW: 'view',
};

export const COLLECTION_CATEGORIES = [
  'DeFi',
  'Layer 1',
  'Layer 2',
  'Meme Coins',
  'NFT',
  'Gaming',
  'AI & Big Data',
  'Privacy Coins',
  'Stablecoins',
  'Exchange Tokens',
];

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
};

export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400,
};

export const COLORS = {
  PRIMARY: '#0d6efd',
  SUCCESS: '#198754',
  DANGER: '#dc3545',
  WARNING: '#ffc107',
  INFO: '#0dcaf0',
  LIGHT: '#f8f9fa',
  DARK: '#212529',
};

export const CHART_COLORS = [
  '#0d6efd', // Primary blue
  '#198754', // Success green
  '#dc3545', // Danger red
  '#ffc107', // Warning yellow
  '#0dcaf0', // Info cyan
  '#6f42c1', // Purple
  '#fd7e14', // Orange
  '#20c997', // Teal
  '#e83e8c', // Pink
  '#6c757d', // Secondary gray
];

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  COIN_ID: /^[a-z0-9\-]+$/,
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful! Welcome back!',
  REGISTER_SUCCESS: 'Registration successful! Welcome to DejaVu NFT!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  ITEM_ADDED: 'Item added successfully!',
  ITEM_UPDATED: 'Item updated successfully!',
  ITEM_DELETED: 'Item deleted successfully!',
};
