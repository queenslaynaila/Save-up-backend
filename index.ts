import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import cors from 'cors';
import { HttpError } from './middleware/errorMiddleware';
import usersRoutes from './routes/users/index';
import nextOfKinRoutes from './routes/nextOfKin/index';
import categoriesRoutes from './routes/categories/index';
import pocketRoutes from './routes/pockets/index';
import expensesRoutes from './routes/expenses/index';
import savingRoutes from './routes/savings/index';
import AdminRoutes from './routes/admin/index';
import candidateRoutes from './routes/candidates/index';
import passwordRoutes from './routes/pin/index';
import securityQuestionsRoutes from './routes/securityQuestions';
import securityAnswerRoutes from './routes/securityAnswer/index';
import cumulativesRoutes from './routes/userCumulatives/index';
import groupRoutes from './routes/groups/index';
import electionRoutes from './routes/elections/index';
import inviteRoutes from './routes/invitations/index';
import withdrawalRoutes from './routes/withdrawals/index';
import transferRoutes from './routes/transfers/index';
import createExSaving from './routes/externalSaving/index';
import ratificationRoutes from './routes/ratifications/index';
import ballotRoutes from './routes/ballots/index';
import groupDepositRoutes from './routes/groupDeposits';
import groupWithdrawalRoutes from './routes/groupWithdrawal';
import groupWithdrawalApprovals from './routes/groupDebitApprovals';
import groupTransactions from './routes/groupTransactions';
import loanRequestRoutes from './routes/loans';
import loanGuaranteeRoutes from './routes/loanGuarantees';
import loanAdminApprovalRoutes from './routes/loanApprovals';
import cron from 'node-cron';
import remindStaleGoals from './cronJobs/overdueGoalsReminder';
import creditInterest from './cronJobs/creditInterest';
import dotenv from 'dotenv';

dotenv.config();

cron.schedule('0 10 */14 * *', remindStaleGoals);
cron.schedule('0 2 */7 * *', creditInterest);

const app = express();
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.json());
app.use(morgan('dev'));
app.use((_, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});
app.use(
  cors({
    exposedHeaders: ['authorization-token', 'refresh-token', 'reset-token']
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
candidateRoutes(app);
ratificationRoutes(app);
securityQuestionsRoutes(app);
securityAnswerRoutes(app);
ballotRoutes(app);
cumulativesRoutes(app);
groupRoutes(app);
inviteRoutes(app);
electionRoutes(app);
withdrawalRoutes(app);
groupWithdrawalApprovals(app);
groupDepositRoutes(app);
groupWithdrawalRoutes(app);
groupTransactions(app);
transferRoutes(app);
loanRequestRoutes(app);
loanGuaranteeRoutes(app);
loanAdminApprovalRoutes(app);
createExSaving(app);

app.use(() => {
  throw new HttpError(404);
});

/* eslint-disable @typescript-eslint/no-unused-vars */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  if (error instanceof HttpError) {
    return res.status(error.status).json({
      errors: error.errors
    });
  }
  return res.sendStatus(500);
});

const port: number = parseInt(process.env.PORT as string, 10);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`app listening on port ${port}`);
});