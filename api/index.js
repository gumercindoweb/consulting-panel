let app;

export default async (req, res) => {
  if (!app) {
    const mod = await import("../dist-server/serverless.js");
    app = mod.default;
  }
  return app(req, res);
};
