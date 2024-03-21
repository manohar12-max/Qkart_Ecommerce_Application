 const httpStatus = require("http-status");
const { Cart, Product, User } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
//const { indexOf } = require("core-js/core/array");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/** 
const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");


/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  //get the cart of specific user
  const cart=await Cart.findOne({email:user.email})
  if(!cart)
  {
    throw new ApiError(httpStatus.NOT_FOUND,"Error does not have cart")
  }
  return cart
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  //in productId we have the id of specific id s=of product selected by user 
  //get the cart of specific user
  
  let userCart = await Cart.findOne({email:user.email});
  let productObj = await Product.findById(productId);

  if (!productObj) {
    throw new ApiError(
      httpStatus.BAD_REQUEST, 
      "Product doesn't exist in database"
    );
  }

  //console.log(cart)
  //if there is no cart present then create a card
  //just do new Cart and dont create and save it for now
  if (!userCart) {
      const cart = await Cart.create({
        email:user.email,
        cartItems:[{
          product: productObj,
          quantity
        }],
      });
       
      if (!cart) {
        console.log(cart)
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR);
      } 
      return await cart.save();
  }
  //mongo db can still give you null cart so do following
  // if (cart == null){
  //   throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,"failed to create cart")
  // }
  // if the product is already present in cart then no need to add again throw an error
  /*
  cart{
    email of user
    cartItems:[
      {product:{_id:ObjectId(1)},{name:toothbrush ,cost:500,rating :6},quantity:12},{product:{_id:ObjectId(1)},{name:toiletpaper,cost:500,rating :6},quantity:5},
    ] //cart items is list of product and quantity in product is productSchema
  }
  */
 //here we used == instead of === cause ==== is strict and checks the data type of both side 
 //here product._id is obeject+str and productId id string 
 //hence use ==
 //also some return true or false maybe acting like find
  if (userCart.cartItems.find(items=> items.product._id.toString()===productId)){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product already in cart. Use the cart sidebar to update or remove product from cart")
  }

  //now its time to fetch the product of the users priviously stored which will be in mongo db 
  //by searching the productId
 // const product= await Product.findOne({_id:productId}) 
  //if the product does not exist which means user is asking for product does not exist
  // if(!product)
  // {
  //   throw new ApiError(httpStatus.BAD_REQUEST,"Product does not exist in data base")
  // }

  //now we know product to add is new and product is not in cart so push it to cart items
   userCart.cartItems.push({product:productObj,quantity:quantity})
   await userCart.save()
   return userCart
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>
 * @throws {ApiError} 
 */ 
const updateProductInCart = async (user, productId, quantity) => {
  const userCart=await Cart.findOne({email:user.email})
  if (!userCart){
   throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart. Use POST to create cart and add a product")
  }
  const product=await Product.findOne({_id:productId})
  if(!product){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database")
   }
  const productIndex= userCart.cartItems.findIndex(items=> items.product._id==productId)
  if(productIndex == -1){
   throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart")
  }
  userCart.cartItems[productIndex].quantity=quantity;
  await userCart.save()
  return userCart
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 * 
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  const userCart=await Cart.findOne({email:user.email})
 if (!userCart){
  throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart")
 }
 //const productIndex=indexOf(userCart.cartItems.product)
 const productIndex= userCart.cartItems.findIndex(items=> items.product._id==productId)

 if(productIndex == -1){
  throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart")
 }
 // use splice to delete item in splice first argument is from where to splice and how many items to splice in second argument
 userCart.cartItems.splice(productIndex,1)
 await userCart.save();
 
};

//};

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
  const cart=await Cart.findOne({email:user.email})
  if(cart==null){
    throw new ApiError(httpStatus.NOT_FOUND,"User Cart unavailable")
  }
  if(cart.cartItems.length==0){
      throw new ApiError(httpStatus.BAD_REQUEST,"User does not have items in cart ")
    }
    // auser must have non default address
    const hasSetNonDefaultAddress= await user.hasSetNonDefaultAddress()
  if(!hasSetNonDefaultAddress){
    throw new ApiError(httpStatus.BAD_REQUEST,"Address not set ")
  }
  
  const total= cart.cartItems.reduce((total,items)=>{
    total=total+ items.quantity* items.product.cost;
    return total;
  },0)
if (total> user.walletMoney){
  throw new ApiError(httpStatus.BAD_REQUEST,"Does not have sufficient balance ")
}
  user.walletMoney -=total
  await user.save()
  //after checking out i will empty the cart
cart.cartItems=[]
await cart.save()

};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
