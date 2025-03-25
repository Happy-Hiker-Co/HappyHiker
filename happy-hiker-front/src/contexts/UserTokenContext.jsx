import React, { createContext, useState, useEffect} from "react";

// have to call the create function to make a context
const UserTokenContext = createContext()

// need a provider to wrap our app - the children are our props to pass
export const UserTokenProvider = ({ children }) => {
    
    // state for out token - starts off as null (doesn't exist)
    const [token, setToken] = useState(null)

    // this will update the state of token and also store it in local storage
    const setUserToken = (newToken) => {
        setToken(newToken)
        sessionStorage.setItem("userToken", newToken)
    }

    // the empty [] makes it only run once when component mounts
    // will check if there's one in session storage
    // if found will update with session storage token
    useEffect(() => {
        const savedToken = sessionStorage.getItem("userToken")
        if (savedToken) {
            setToken(savedToken)
        }
    }, [])
    
    // clears token - can attach to a logout function
    const clearUserToken = () => {
        setToken(null)
        sessionStorage.removeItem("userToken")
    }

    // can track if user is logged in and make userprofile private
    const isAuthenticated = token !== null

    return (
        //this is what will be shared across the app inside the wrapper
        <UserTokenContext.Provider value={{ token, setUserToken, clearUserToken, isAuthenticated }}>
            { children }
        </UserTokenContext.Provider>
    )
}