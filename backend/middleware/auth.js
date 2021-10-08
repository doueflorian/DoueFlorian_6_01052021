const jwt = require('jsonwebtoken');

// Utiliser le token créé à l'authentification
module.exports = (req, res, next) => {
  try {
    // Récupérer le token depuis le Header "Authorization"
    // Split entre Bearer et <Token> et le stocker dans decodedToken
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'akoikfgtyhnn');
    // Comparer l'userId et l'userId stocké dans le token
    const userId = decodedToken.userId;
    // Vérifier la comparaison et laisser ou non le contrôle à l'utilisateur
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};