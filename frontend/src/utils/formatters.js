// Utility functions for formatting numbers, currencies, and percentages

export const formatPrice = (price) => {
  if (!price && price !== 0) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 8 : 2
  }).format(price);
};

export const formatNumber = (number) => {
  if (!number && number !== 0) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8
  }).format(number);
};

export const formatLargeNumber = (num) => {
  if (!num && num !== 0) return 'N/A';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (absNum >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (absNum >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (absNum >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  
  return num.toLocaleString();
};

export const formatPercentage = (percentage, decimals = 2) => {
  if (!percentage && percentage !== 0) return 'N/A';
  
  const formatted = percentage.toFixed(decimals);
  return `${percentage > 0 ? '+' : ''}${formatted}%`;
};

export const formatMarketCap = (marketCap) => {
  if (!marketCap && marketCap !== 0) return 'N/A';
  
  return `$${formatLargeNumber(marketCap)}`;
};

export const formatVolume = (volume) => {
  if (!volume && volume !== 0) return 'N/A';
  
  return `$${formatLargeNumber(volume)}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatSupply = (supply, symbol = '') => {
  if (!supply && supply !== 0) return 'N/A';
  
  return `${formatLargeNumber(supply)} ${symbol}`.trim();
};

export const getPriceChangeColor = (change) => {
  if (change > 0) return 'success';
  if (change < 0) return 'danger';
  return 'secondary';
};

export const getPriceChangeIcon = (change) => {
  if (change > 0) return 'fa-arrow-up';
  if (change < 0) return 'fa-arrow-down';
  return 'fa-minus';
};
