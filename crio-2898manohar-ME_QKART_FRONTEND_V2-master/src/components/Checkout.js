import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * @typedef {Object} Address - Data on added address
 *
 * @property {string} _id - Unique ID for the address
 * @property {string} address - Full address string
 */

/**
 * @typedef {Object} Addresses - Data on all added addresses
 *
 * @property {Array.<Address>} all - Data on all added addresses
 * @property {string} selected - Id of the currently selected address
 */

/**
 * @typedef {Object} NewAddress - Data on the new address being typed
 *
 * @property { Boolean } isAddingNewAddress - If a new address is being added
 * @property { String} value - Latest value of the address being typed
 */

// TODO: CRIO_TASK_MODULE_CHECKOUT - Should allow to type a new address in the text field and add the new address or cancel adding new address
/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { String } token
 *    Login token
 *
 * @param { NewAddress } newAddress
 *    Data on new address being added
 *
 * @param { Function } handleNewAddress
 *    Handler function to set the new address field to the latest typed value
 *
 * @param { Function } addAddress
 *    Handler function to make an API call to add the new address
 *
 * @returns { JSX.Element }
 *    JSX for the Add new address view
 *
 */
const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
 })=>{
  console.log(handleNewAddress)
  return(
    <Box display="flex" flexDirection="column">
      <TextField
       multiline
       minRows={4}
       placeholder="Enter your complete address"
       value={newAddress.value}
       onChange={(e)=>{
        handleNewAddress({
          ...newAddress,
          value:e.target.value
        });
       }}
       />
      <div>{console.log(newAddress)}</div>
       <Stack direction="row" my="1rem">
        <Button
        variant="contained"
        onClick={()=>{
          addAddress(token, newAddress)
        }}
        >
          Add
        </Button>
        <Button
        variant="text"
        onClick={()=>{
          handleNewAddress({
            ...newAddress,
            isAddingNewAddress:false,
          })
        }}
        >
          Cancel
        </Button>

       </Stack>
    </Box>
  )

}

const Checkout = () => {
  const { enqueueSnackbar } = useSnackbar();
  const history=useHistory()
  const [products,setProducts]=useState([])
  const [items,setItems]=useState([])
  const [addresses,setAddresses]=useState({all: [],selected:""})//in all we will get all addresses data and in 
  const [newAddress,setNewAddress]=useState({                   // selected we will get only id of selected address
    isAddingNewAddress:false,value:"",
  });
  let token=localStorage.getItem("token")

  const productsCall = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setProducts(response.data);
      return response.data
      
    } catch (e) {

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
    // enqueueSnackbar(
    //   "Could'nt fetch cart details",
    //   {variant:"error"}
    // )
    return null;
  }
}
const deleteAddsress=async (token,addressId)=>{
  try {
    const response = await axios.delete(`${config.endpoint}/user/addresses/${addressId}`, {
        headers:{
          Authorization :`Bearer ${token}` ,
        },
      }
    )
    
    setAddresses({...addresses,all:response.data});
    return response.data;
  } catch(e){
    throw new Error("Error");
  }
}


const addAddress=async(token,newAddress)=>{
  try {
    const response = await axios.post(
      `${config.endpoint}/user/addresses`,
    {address:newAddress.value},
    {
      headers:{
        Authorization :`Bearer ${token}` ,
      }
    }
    );
    setAddresses({...addresses, all:response.data});
    setNewAddress({value:"",isAddingNewAddress:false});
    console.log(addresses)
    return response.data

  }catch(e){
   console.log(e)
  }
}

const getAddress= async (token)=>{
  if(!token )return;
try {const response=await axios.get(`${config.endpoint}/user/addresses`,{
  headers:{
    Authorization: `Bearer ${token}`
  },
})
 setAddresses({...addresses,all : response.data})

return response.data;
}
catch(e){
  console.log(e)
  return null;
}
}
const validateRequest= (items,addresses)=>{
if(localStorage.getItem("balance")<getTotalCartValue(items)){
  enqueueSnackbar("You do not have enough balance in your wallet for this purchacse",{variant:"warning"})
  return false
}
if(!addresses.all.length){
  enqueueSnackbar("Please add a new address beforee proceeding.",{variant:"warning"})
}
if(!addresses.selected.length){
  enqueueSnackbar("Please select one shipping address to proceed",{variant:"warning"});
  return false
}
return true
}

const performCheckOut= async (token,items,addresses)=>
{ 
  if(!validateRequest(items,addresses))return
      try{
       const response=await axios.post(`${config.endpoint}/cart/checkout`,
       {
        addressId:addresses.selected
       },
       {
        headers:{
          Authorization :`Bearer ${token}` ,
        }
      })
      enqueueSnackbar("Order Placed Sucessfully",{variant:"succsess"})
      const Balance=parseInt(localStorage.getItem("balance"))-getTotalCartValue(items)
                localStorage.setItem("balance",Balance);
                history.push("/thanks")
      return true
      }catch(e){
        enqueueSnackbar("Order Placed UnSucessfully",{variant:"error"})
    
      }
}


useEffect(()=>{

if (token){
  getAddress(token)
  
}
else{
  enqueueSnackbar("You must login to access Checkout page",{variant:"warning"})
  history.push("/")
}

},[token])//when to call every time token is changed




  useEffect( () => {
    const onLoad= async ()=>{
      //fetch whole cards on main page 
    const productD = await productsCall();
    //only get certain items prviously present on card
    const cartData= await fetchCart(token) //in cartData we have productID and quantity
    //merge both since cartData will have same id product as productD id 
    if(productD && cartData){
    const cardDetails=  generateCartItemsFrom(cartData,productD) // we have to merge both data
    setItems(cardDetails) 
    }//here we not only get id but whole name and all because of merging
    }
    onLoad();
  }, []);



  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
            
             {addresses.all.length ?(
              addresses.all.map((item)=>(
                <Box
                 key={item._id}
                className={
                  addresses.selected===item._id 
                  ? "address-item selected"
                  :  "address-item not-selected" 
                }
                  onClick={()=>{
                    setAddresses({...addresses,selected: item._id});
                    
                  }}
                  >
                  <Typography>{item.address}</Typography>
                  <Button 
                  startIcon={<Delete />}
                  onClick={async()=>{
                    await deleteAddsress(token,item._id);
                    console.log(item._id)
                  }}>
                    Delete
                  </Button>
                
                </Box>
              ))
             ):(<Typography >
             No address found for this account.Please add to proceed
           </Typography>  
           )}
             </Box>
             {!newAddress.isAddingNewAddress &&(
              <Button
              color="primary"
              variant="contained"
               id="add-new-btn"
              size="large"
              onClick={()=>{
                setNewAddress({
                  ...newAddress,
                  isAddingNewAddress:true,
                })
              }}
              >
                Add new address
              </Button>
             )}
             {newAddress.isAddingNewAddress && (
              <AddNewAddressView
              token={token}
              newAddress={newAddress}
              handleNewAddress={setNewAddress}
              addAddress={addAddress}
              />
             )

             }

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick={async ()=>{
                await performCheckOut(token, items ,addresses)
              }}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly={true} products={products} items={items} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
