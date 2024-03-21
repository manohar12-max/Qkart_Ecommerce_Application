import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [logindata,setLogindata]=useState({
    username:"",
    password:""
  })
  const [isLoading,setIsLoading]=useState(false)
  const history=useHistory()

  // TODO: CRIO_TASK_MODULE_LOGIN - Fetch the API response
  /**
   * Perform the Login API call
   * @param {{ username: string, password: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/login"
   *
   * Example for successful response from backend:
   * HTTP 201
   * {
   *      "success": true,
   *      "token": "testtoken",
   *      "username": "criodo",
   *      "balance": 5000
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Password is incorrect"
   * }
   *
   */
  const login = async (formData) => {
    if(!validateInput(formData)){
      setIsLoading(false);
      return
    }
    try{
     
      const response= await axios.post(`${config.endpoint}/auth/login`,{username:formData.username,password:formData.password})
      enqueueSnackbar(
        "Logged in Successful",
        { variant: "success" }
        
      )
      setIsLoading(false);
      persistLogin(
        response.data.token,
        response.data.username,
        response.data.balance
      )
      history.push("/")
    }
    catch(e){
      setIsLoading(false);
      if(e.response && e.response.status===400){
        enqueueSnackbar(
          `${e.response.data.message}`,
          { variant: "error" }
          
        )
      }
      else{
        enqueueSnackbar(
          "Something went wrong",
          { variant: "error" }
          
        )
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_LOGIN - Validate the input
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false and show warning message if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that password field is not an empty value - "Password is a required field"
   */
  const validateInput = (data) => {
    if (data.username===""){
      enqueueSnackbar(
        "Username is a required field",
        { variant: "warning" }
      )
      return false
      }
      else if(data.password.length===0){
        enqueueSnackbar(
          "Password is a required field ",
          { variant: "warning" }
        )
        return false;
        }
        else return true;
  };

  // TODO: CRIO_TASK_MODULE_LOGIN - Persist user's login information
  /**
   * Store the login information so that it can be used to identify the user in subsequent API calls
   *
   * @param {string} token
   *    API token used for authentication of requests after logging in
   * @param {string} username
   *    Username of the logged in user
   * @param {string} balance
   *    Wallet balance amount of the logged in user
   *
   * Make use of localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   * -    `token` field in localStorage can be used to store the Oauth token
   * -    `username` field in localStorage can be used to store the username that the user is logged in as
   * -    `balance` field in localStorage can be used to store the balance amount in the user's wallet
   */
  const persistLogin = (token, username, balance) => {
    localStorage.setItem("token",token);
    localStorage.setItem("username",username);
    localStorage.setItem("balance",balance)
  };
  const loginHandlerOnChange=(e)=>{
    let name=e.target.name;
    let value=e.target.value;
    setLogindata({...logindata ,[name]:value})
  }
  const loginHandlerONSubmit=(e)=>{
    setIsLoading(true)
   e.preventDefault();
   login(logindata)
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons={true} />
      <Box className="content">
        <form className="form" onSubmit={loginHandlerONSubmit}>
        <Stack spacing={2}>
        <h2 className="title1">Login</h2>
        <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder={"Enter Username"}
            fullWidth
            value={logindata.username}
            onChange={loginHandlerOnChange}
          />
        <TextField
          id="password"
          label="password"
          placeholder="Password"
          variant="outlined"
          name="password"
          fullWidth
          type="password"
          value={logindata.password}
          onChange={loginHandlerOnChange}
        />
        { isLoading ? <CircularProgress/> : <Button  variant="contained" type="submit">
          LOGIN TO QKART
          </Button>}
        <p className="secondary-action">Don’t have an account? 
          <Link className="link" to="/register">Register Now</Link>
        </p>
        </Stack>
        </form>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
