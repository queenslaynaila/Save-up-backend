import Router from '../../router';
import guaranteeLoan from './guaranteeLoan';
import getGuarantorRequests from './getGuarantorRequests';

const router = Router.getInstance('/guarantors', 'Guarantors');

guaranteeLoan(router);
getGuarantorRequests(router);
