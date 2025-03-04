import Router from '../../router';
import createFundraiser from './createDonationPockets';
import getDonationPockets from './getDonationPockets';

const router = Router.getRouterInstance('/donations', 'Donations');

createFundraiser(router);
getDonationPockets(router);

export default router;