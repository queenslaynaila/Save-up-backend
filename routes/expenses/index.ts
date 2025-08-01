import Router from '../../new/router';
import createExpense from './createExpense';
import getExpensesByEntity from './getExpensesByEntity';
import updateExpense from './updateExpense';
import deleteExpense from './deleteExpense';

const expenseRouter = Router.createResourceRouter('Expenses');

createExpense(expenseRouter);
getExpensesByEntity(expenseRouter);
updateExpense(expenseRouter);
deleteExpense(expenseRouter);

export default expenseRouter;
