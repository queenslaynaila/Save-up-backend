import Router from '../../router';
import createExpense from './createExpense';
import deleteExpense from './deleteExpense';
import getExpensesByEntity from './getExpensesByEntity';
import updateExpense from './updateExpense';
import getTotalUserExpenditure from './getTotalUserExpenditure';

const router = Router.getRouterInstance('/expenses', 'Expenses');
createExpense(router);
getExpensesByEntity(router);
updateExpense(router);
deleteExpense(router);
getTotalUserExpenditure(router);

export default router;