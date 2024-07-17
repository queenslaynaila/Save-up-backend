import rateLimit from 'express-rate-limit';

const resetRequestsLimit = {
  windowMs: 24 * 60 * 60 * 1000, 
  max: 10,
  message: 'Too many requests',
};
  
export const resetPasswordLimiter = rateLimit(resetRequestsLimit);