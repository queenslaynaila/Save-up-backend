import Router from '../../new/router';

const logout = (router: Router) => {
  router.delete({
    path: '/logout',
    summary: 'Logout',
    auth: true,
    handler: async (_req, res) => {
      res.removeHeader('Authorization');
      res.sendStatus(204);
    }
  });
};

export default logout;