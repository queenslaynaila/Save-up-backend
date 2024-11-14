import { generateOpenApiSpec } from './router';
import { app } from './routes/categories/getAllCategories';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

app.use((_, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    exposedHeaders: ['authorization-token']
  })
);

const openApiSpec = generateOpenApiSpec();
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Start Express server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});