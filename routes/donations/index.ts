import Router from '../../core/router';
import createFundraiser from './createDonationPockets';
import getDonationPockets from './getDonationPockets';

const router = Router.createResourceRouter('Donations', true);

createFundraiser(router);
getDonationPockets(router);

export default router;