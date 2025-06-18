/* eslint-disable @typescript-eslint/no-unused-vars */
import 'express-async-errors';
import { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import Router, { generateOpenApiSpec } from './router';
import HttpError from './httpError';
import logger from './logger';
import Config from './config';
// import './generatePresignedUrl';
// import './routes/securityQuestions/index';
// import './routes/categories/index';
// import './routes/auth/index';
import './routes/users/index';
// import './routes/nextOfKin/index';
// import './routes/groups/index';
// import './routes/elections/index';
// import './routes/groupWithdrawals/index';
// import './routes/loans/index';
// import './routes/groupDebits/index';
// import './routes/pockets/index';
// import './routes/stats/index';
// import './routes/expenses/index';
// import './routes/donations/index';
// import './routes/transactions/index';

extendZodWithOpenApi(z);

const app = Router.getAppInstance();

const openApiSpec = generateOpenApiSpec();

app.use('/saveup/swagger', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get('/saveup/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});
app.use('/saveup/redocly', (_req, res) => {
  const redocHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Saveup API</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet"/>
      </head>
      <body>
         <redoc spec-url='/saveup/openapi.json'></redoc>
        <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
      </body>
    </html>
  `;
  res.send(redocHtml);
});

app.use('/saveup/rapidoc', (_req, res) => {
  const html = `
    <!doctype html>
    <html>
      <head>
        <script type="module" src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"></script>
        <title>SaveUp API - RapiDoc</title>
      </head>
      <body>
        <rapi-doc 
          spec-url="/saveup/openapi.json"
          theme="light"
          show-header="true"
          allow-authentication="true"
          allow-server-selection="true"
          render-style="view"
        >
        </rapi-doc>
      </body>
    </html>
  `;
  res.send(html);
});

app.use('/saveup/spotlight', (_req, res) => {
  const spotLightHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
        <meta charset="UTF-8" />
        <title>Stoplight Docs</title>
      </head>
      <body>
        <elements-api
           apiDescriptionUrl="/saveup/openapi.json"
          router="hash"
        />
      </body>
    </html>
  `;
  res.send(spotLightHtml);
});

app.use((_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});

app.use((_req: Request, _res: Response, _next: NextFunction): void => {
  throw new HttpError(404);
});

// eslint-disable-next-line func-names
app.use(function (error: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    res.status(error.status).json(error);
  } else {
    logger.error(error.stack);
    res.sendStatus(500);
  }
});

app.listen(Config.PORT, (): void => {
  logger.info(`Server running on port ${Config.PORT}`);
});
