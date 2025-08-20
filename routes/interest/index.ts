import Router from '../../core/router';  
import createInterestRates from './createInterestRates';
import updateInterestRates from './updateInterestRates';
import getInterestRates from './getInterestRates';

const router = Router.getOrCreateRouter('Interest Rates');

createInterestRates(router);
updateInterestRates(router);
getInterestRates(router);

export default router;