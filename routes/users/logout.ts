import authMiddleware from '../../middleware/authorization';
import Router from '../../router';

const logout = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/logout',
    summary: 'Logout a user',
    response: {
      statusCode: 204
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      res.removeHeader('Authorization');
      res.sendStatus(204);
    }
  });
};

export default logout;