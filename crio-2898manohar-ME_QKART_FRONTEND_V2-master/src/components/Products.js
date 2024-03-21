import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import { Button } from "@mui/material";
import ProductCard from "./ProductCard.js";
import Cart,{generateCartItemsFrom} from "./Cart";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [productData, setProductData] = useState([]);//acting like filtered product
  const [isLoading, setIsLoading] = useState(true);
  
  const [debounceTimeout, setDebounceTimeout] = useState(0);
  const [spareProdutcs,setSpareProducts]=useState([]); //these are used to store all products
                                                      //and are used in carts
  const [items,setItems]=useState([]) //the items here are used to store the cart items before and 
                                      //and after cart values
  
  let token = localStorage.getItem("token")//token is a type of acknowlegement if page is 
                                           //logged in or not

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setProductData(response.data);
      setSpareProducts(response.data);
      setIsLoading(false);
      return response.data
      
    } catch (e) {
      setIsLoading(false);
      console.log(e);
    }
  };
  
  const fetchCart= async (token)=>{ //from here we will check the things in cart
                                    //which were previously present in Cart if present render them
    if(!token){
      return}
    try{
   const response= await  axios.get(`${config.endpoint}/cart`,{
    headers:{
      Authorization :`Bearer ${token}`}
   })
   return response.data
  }
  catch(e){
    enqueueSnackbar(
      "Could'nt fetch cart details",
      {variant:"error"}
    )
    return null;
  }
}
//In useEffect we have to set all products on the main page , set the cart with no. of products and all by using previous data
   useEffect( () => {
    const onLoad= async ()=>{
      //fetch whole cards on main page 
    const productD = await performAPICall();
    //only get certain items prviously present on card
    const cartData= await fetchCart(token) //in cartData we have productID and quantity
    //merge both since cartData will have same id product as productD id 
    const cardDetails=  generateCartItemsFrom(cartData,productD) // we have to merge both data
    setItems(cardDetails) //here we not only get id but whole name and all because of merging
    }
    onLoad();
  }, []);
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setProductData(response.data)
      setIsLoading(false);
      
      
    } catch (e) {
      console.log(e.response);
      setIsLoading(false);
      setProductData([]);
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimer) => {
    

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    let timer = setTimeout(() => {
      performSearch(event.target.value);
    }, debounceTimer);
    setDebounceTimeout(timer);
  };


 const updateCartItems=(cartData,spareproducts)=>
  {
    const cartItems=  generateCartItemsFrom(cartData,spareproducts)
    setItems(cartItems)
    console.log(items)
  }

const addToCart= async(
  token,
  items,
  spareProdutcs,
  productsid,
  qty,
  options={ preventDuplicate:false}
   )=>{
    if(!token){
      enqueueSnackbar("Login to add an item to the Cart",
      {variant:"warning"}
      )
      return
    } //
    console.log(options.preventDuplicate)
    if(options.preventDuplicate && items.find(item=>item.productId===productsid)){
      enqueueSnackbar("item already in cart. Use the cart sidebar to update quantity or remove item",
      {variant:"warning"}
      )
      return
    }
    try {
     const response=await axios.post(`${config.endpoint}/cart`,{
      productId:productsid,
      qty:qty},
      {
        headers:{
          Authorization :`Bearer ${token}`,
        }
      });
      updateCartItems(response.data,spareProdutcs)//to add and merge new items
    }
    catch{
        enqueueSnackbar("Error adding to cart",{variant:"warning"})
        
    }
    return true;
  }

  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
          className="search-desktop"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(e) => debounceSearch(e, 500)}
          autoComplete="off"
        />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => debounceSearch(e, 500)}
      />
      <Grid container>
        <Grid item xs={12}
         md={token && spareProdutcs.length ? 9 :12}
        className="product-grid">
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
          {isLoading ? (
            <Box className="loading">
              {" "}
              <CircularProgress />
              <h5>Loading products…</h5>
            </Box>
          ) : (
            <Grid
              container
              spacing={1}
              justifyContent="center"
              alignItems="center"
              columnSpacing={{ xs: 1, md: 3 }}
              marginY="1rem"
            >
              {productData.length ? (
                productData.map((products) => (
                  <Grid item xs={6} md={3} key={products._id}>
                    <ProductCard product={products} 
                    handleAddToCart={async()=>{
                    await addToCart(
                      /* what all things are needed to item in cart
                       1st if token is present we will show cart else we wont 
                       2nd check if there are in items so that we can render it after login
                       3rd spareProducts is to pass to updateitems to add new items to cart
                       4th to prevent Duplicate use flag first set it to true
                       5th defaultly set qty 1*/
                      token,
                      items,
                      spareProdutcs,
                      products._id,
                      1,{
                        preventDuplicate:true
                       })
                    }}  />
                  </Grid>
                ))
              ) : (
                <Box className="loading">
                  <SentimentDissatisfied />
                  <h5>No Products Found</h5>
                </Box>
              )}
            </Grid>
          )}
        </Grid>
        {token  ? (
        <Grid item xs={12} md={3}>
          <Cart products={spareProdutcs} items={items} handleQuantity={addToCart} hasCartbutton={true}/>
        </Grid>):(null)}
      </Grid>

      <Footer />
    </div>
  );
};

export default Products;
