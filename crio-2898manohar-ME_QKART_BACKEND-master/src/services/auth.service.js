const httpStatus = require("http-status");
const userService = require("./user.service");
const ApiError = require("../utils/ApiError");

/**
 * Login with username and password
 * - Utilize userService method to fetch user object corresponding to the email provided
 * - Use the User schema's "isPasswordMatch" method to check if input password matches the one user registered with (i.e, hash stored in MongoDB)
 * - If user doesn't exist or incorrect password,
 * throw an ApiError with "401 Unauthorized" status code and message, "Incorrect email or password"
 * - Else, return the user object
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  //password is checeked in the mongo schema as new method
  const user= await userService.getUserByEmail(email);
  if (!user){
    throw new ApiError(httpStatus.UNAUTHORIZED,"Incorect password or email")
   }
  // to call password method from schema we do user.method cause its for specific document 
  //while to call static we have to give entire model User.isEmailTaken() //already written in model
  const isPasswordValid=await user.isPasswordMatch(password) //method refers to perticular document over here it is refering to pertocular user document
  //just fyi since static represents entire documents we have acces by User.
  if (!isPasswordValid){
   throw new ApiError(httpStatus.UNAUTHORIZED,"Incorect password or email")
  }
 return user

};

module.exports = {
  loginUserWithEmailAndPassword,
};
