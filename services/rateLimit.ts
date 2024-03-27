//import fastifyRateLimit from "@fastify/rate-limit";

export const resetRequestsLimit = {
  timeWindow: '1 day', 
  max: 10,
  message: 'Too many requests',
};
  


