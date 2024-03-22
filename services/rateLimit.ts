import rateLimit from 'express-rate-limit';

const resetRequestsLimit = {
  windowMs: 24 * 60 * 60 * 1000, 
  max: 5,
  message: 'Too many password reset requests, please try again later',
};
  
export const resetPasswordLimiter = rateLimit(resetRequestsLimit);

