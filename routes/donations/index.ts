import Router from '../../core/router';
import createFundraiser from './createDonationPockets';
import getDonationPockets from './getDonationPockets';

const router = Router.getOrCreateRouter('Donations', true);

createFundraiser(router);
getDonationPockets(router);

export default router;