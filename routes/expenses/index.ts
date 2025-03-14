import Router from '../../router';
import createExpense from './createExpense';
import getExpensesByEntity from './getExpensesByEntity';
import updateExpense from './updateExpense';
import deleteExpense from './deleteExpense';
import getTotalUserExpenditure from './getTotalUserExpenditure';

const expenseRouter = Router.getRouterInstance('', 'Expenses');

createExpense(expenseRouter);
getExpensesByEntity(expenseRouter);
updateExpense(expenseRouter);
deleteExpense(expenseRouter);
getTotalUserExpenditure(expenseRouter);

export default expenseRouter;
