import Router from '../../router';
import createDonations from './createDonationPockets';
import getDonationPockets from './getDonationPockets';

const router = Router.getRouterInstance('/donations', 'Donations');

createDonations(router);
getDonationPockets(router);

export default router;