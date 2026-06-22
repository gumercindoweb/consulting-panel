let server;

export default async (req, res) => {
  if (!server) {
    const { app } = await import('../dist-server/index.js');
    server = app;
  }
  return server(req, res);
};
