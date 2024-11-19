import Router from '../../router';
import guaranteeLoan from './guaranteeLoan';
import getGuarantorRequests from './getGuarantorRequests';

const router = Router.getRouterInstance('/guarantors', 'Guarantors');

guaranteeLoan(router);
getGuarantorRequests(router);
