import Router from '../../router';
import createExpense from './createExpense';
import deleteExpense from './deleteExpense';
import getExpensesByCriteria from './getExpensesByCriteria';
import updateExpense from './updateExpense';
import getTotalUserExpenditure from './getTotalUserExpenditure';

const router = Router.getRouterInstance('/expenses', 'Expenses');
createExpense(router);
getTotalUserExpenditure(router);
getExpensesByCriteria(router);
updateExpense(router);
deleteExpense(router);


export default router;