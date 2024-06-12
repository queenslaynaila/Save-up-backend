import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import cors from 'cors';
import { HttpError } from './middleware/errorMiddleware';
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import usersRoutes from './routes/users/index';
import nextOfKinRoutes from './routes/nextOfKin/index';
import categoriesRoutes from './routes/categories/index';
import pocketRoutes from './routes/pockets/index';
import expensesRoutes from './routes/expenses/index';
import savingRoutes from './routes/savings/index';
import AdminRoutes from './routes/admin/index';
import passwordRoutes from './routes/pin/index';
import securityQuestionsRoutes from './routes/securityQuestions';
import securityAnswerRoutes from './routes/securityAnswer/index';
import cumulativesRoutes from './routes/cumulatives/index';
import groupRoutes from './routes/groups/index';
import groupAdminRoutes from './routes/groupAdministrators/index'
import inviteRoutes from './routes/invitations/index';
import withdrawalRoutes from './routes/withdrawals/index';
import transferRoutes from './routes/transfers/index';
import transactionRoutes from './routes/transactions/index';
import createExSaving from './routes/externalSaving/index';
import cron from 'node-cron';
import remindStaleGoals from './cronJobs/overdueGoalsReminder'
import creditInterest from './cronJobs/creditInterest';

cron.schedule('0 10 */14 * *', remindStaleGoals);
cron.schedule('0 2 */7 * *', creditInterest);

//Swagger docs
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Saveup API",
      version: "1.0.0",
      description: "API DOC FOR SAVEUP",
    },
    servers: [
      {
        url: "http://localhost:3001",
      },
    ],
    security: [{
      AuthorizationToken: [],
      RefreshToken: [],
    }],
    components: {
      securitySchemes: {
        AuthorizationToken: {
          type: "apiKey",
          name: "Authorization-Token",
          in: "header",
          description: "The access token for authentication",
        },
        RefreshToken: {
          type: "apiKey",
          name: "Refresh-token",
          in: "header",
          description: "The refresh token for authentication",
        },
      },
    },
  },
  apis: ["./routes/**/swagger.yml"],
};

const specs = swaggerJsDoc(options);

// Middleware
const app = express();
app.use("/api", swaggerUI.serve, swaggerUI.setup(specs));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.json());
app.use(morgan('dev'));
app.use((_, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});
app.use(
  cors({
    exposedHeaders: ['authorization-token','refresh-token','reset-token'],
  })
);

// Routes
usersRoutes(app);
nextOfKinRoutes(app);
pocketRoutes(app);
expensesRoutes(app);
savingRoutes(app);
passwordRoutes(app);
categoriesRoutes(app);
AdminRoutes(app);
securityQuestionsRoutes(app);
securityAnswerRoutes(app);
cumulativesRoutes(app);
groupRoutes(app);
inviteRoutes(app);
groupAdminRoutes(app);
withdrawalRoutes(app);
transferRoutes(app)
transactionRoutes(app)
createExSaving(app)

// 404 handler
app.use(() => {
  throw new HttpError(404, 'Route Not found');
});

// Global error handler
/* eslint-disable @typescript-eslint/no-unused-vars */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(`this is error ${error}`)
  if (error instanceof HttpError) {
    console.log('http errror starts here:', error);  
    return res.status(error.statusCode).json({ error: error.message });
  }
  return res.status(500).json({ error: 'Internal Server error' });
});


export default app;