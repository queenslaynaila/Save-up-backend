import Router from '../../router';
import createExpense from './createExpense';
import deleteExpense from './deleteExpense';
import getExpensesById from './getExpenseById';
import getExpensesByCriteria from './getExpensesByCriteria';
import updateExpense from './updateExpense';

const router = Router.getInstance('/expenses', 'Expenses');

createExpense(router);
deleteExpense(router);
getExpensesById(router);
getExpensesByCriteria(router);
updateExpense(router);

export default router;