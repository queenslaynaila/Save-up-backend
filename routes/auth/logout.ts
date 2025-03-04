import Router from '../../router';

const logout = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/logout',
    summary: 'Logout a user',
    response: {
      204: {}
    },
    authMiddlewareOptions: {},
    handler: async (_req, res) => {
      res.removeHeader('Authorization');
      res.sendStatus(204);
    }
  });
};

export default logout;