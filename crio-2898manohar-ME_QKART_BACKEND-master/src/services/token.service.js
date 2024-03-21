const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { tokenTypes } = require("../config/tokens");

/**
 * Generate jwt token
 * - Payload must contain fields
 * --- "sub": `userId` parameter
 * --- "type": `type` parameter
 *
 * - Token expiration must be set to the value of `expires` parameter
 *
 * @param {ObjectId} userId - Mongo user id
 * @param {Number} expires - Token expiration time in seconds since unix epoch
 * @param {string} type - Access token type eg: Access, Refresh
 * @param {string} [secret] - Secret key to sign the token, defaults to config.jwt.secret
 * @returns {string}
 */
//types Access type token have expiry of 30 min or 1 hr
//while Referesh type token has expiry of 3 -4 days
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload={
    sub:userId,     //we have to use it in passport cause we have acess of payloas over ther
    type:type,
    exp: expires,//exp is compulsory to write as exp or expiresIn
    iat:Date.now()/1000        //iat is second Date.now() gives the present value in ms and dividing by 1000 gives second
  }
  return jwt.sign(payload,secret)
};

/**
 * Generate auth token
 * - Generate jwt token
 * - Token type should be "ACCESS"
 * - Return token and expiry date in required format
 *
 * @param {User} user
 * @returns {Promise<Object>}
 *
 * Example response:
 * "access": {
 *          "token": "eyJhbGciOiJIUzI1NiIs...",
 *          "expires": "2021-01-30T13:51:19.036Z"
 * }
 */
const generateAuthTokens = async (user) => {
  //Date.now()/1000 gives current sec and + config.jwt.accessExpirationMinutes * 60d  gives addition 245 min
const accessTokenExpiry= Math.floor(Date.now()/1000) + config.jwt.accessExpirationMinutes * 60; 
const token=generateToken(user._id,accessTokenExpiry,tokenTypes.ACCESS)
return {
  access:{
    token:token,
    expires:new Date(accessTokenExpiry *1000)
  }
}

};

module.exports = {
  generateToken,
  generateAuthTokens,
};
