import {  useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute =({children}) =>{
const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
const navigate = useNavigate();

useEffect(()=>{
    if(!isAuthenticated){
        navigate("/login");
    }
},[])
return(
    children
)

}
export default ProtectedRoute;