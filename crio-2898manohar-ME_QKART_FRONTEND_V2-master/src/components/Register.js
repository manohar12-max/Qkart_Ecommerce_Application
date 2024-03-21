import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import {config} from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import {Link,useHistory  } from "react-router-dom"
const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [formdata,updateFormdata]=useState({
    "username":"",
    "password":"",
    "confirmPassword":""
  })
  const [isLoading,setIsLoading]=useState(false)
  const history=useHistory()
 

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement the register function
  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */
  const register = async (formData) => {
     if(!validateInput(formData)){
      setIsLoading(false);
      return
     }
    try{
    const response = await axios.post(`${config.endpoint}/auth/register`, { username:formData.username, password:formData.password }); 
    enqueueSnackbar(
      "Registration Successful",
      { variant: "success" }
     )
     history.push("/login")
    setIsLoading(false);
    }
    catch (err) {
      setIsLoading(false);
      if (err.response && err.response.status === 400) {
        enqueueSnackbar("Username is already taken", { variant: 'error' });
      } else {
        enqueueSnackbar("Something went wrong!", { variant: 'error' });
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  const validateInput = (data) => {
    if (data.username===""){
      enqueueSnackbar(
        "Username is a required field",
        { variant: "warning" }
      )
      return false
      }
      else if(data.username.length<6){
        enqueueSnackbar(
          "Username must be at least 6 characters",
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
      else if(data.password.length<6){
      enqueueSnackbar(
        "Password must be at least 6 characters",
        { variant: "warning" }
      )
      return false;
      }
      else if(data.password!==data.confirmPassword){
        enqueueSnackbar( 
          "Password do not match",
          { variant: "warning" }
        )
        return false
      }
      else return true
   // register(data)
  };
 let name,value;
const handlerOnChange=(e)=>{
  name=e.target.name;
  value=e.target.value;
  updateFormdata({...formdata,[name]:value})
}
const handlerOnSubmit=(e)=>{
  e.preventDefault();
  setIsLoading(true)
   register(formdata)
}
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content1">
        <form onSubmit={handlerOnSubmit} className="form1">
        <Stack spacing={2}  >
          <h2 className="title1">Register</h2>
          <TextField
            
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder={"Enter Username"}
            fullWidth
            value={formdata.username}
            onChange={handlerOnChange}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value={formdata.password}
            onChange={handlerOnChange}
            />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={formdata.confirmPassword}
            onChange={handlerOnChange}
          />
          { isLoading ? <CircularProgress/>:<Button type="submit" className="button" variant="contained" >
            Register Now
           </Button> }
          <p className="secondary-action1">
            Already have an account?{" "}
             <Link to="/login" className="link1">
              Login here
              </Link>
          </p>
        </Stack>
        </form>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
