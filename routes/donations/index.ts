import Router from '../../new/router';
import createFundraiser from './createDonationPockets';
import getDonationPockets from './getDonationPockets';

const router = Router.createResourceRouter('Donations');

createFundraiser(router);
getDonationPockets(router);

export default router;