const { auth } = require('express-oauth2-jwt-bearer');

const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
});

const checkRole = (allowedRoles) => (req, res, next) => {
  const roles = req.auth?.['https://your-api/roles'] || [];
  if (!allowedRoles.some(role => roles.includes(role))) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = { checkJwt, checkRole };