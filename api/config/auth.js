const { validateToken } = require('./tokens');

function validateAuth(req,res,next){
    const token = req.cookies.token;
  const { payload } = validateToken(token, { name: '', lastName: '', email: '' });

  if (!payload) return res.sendStatus(401);

  req.user = payload;

  next()
}

module.exports = validateAuth;