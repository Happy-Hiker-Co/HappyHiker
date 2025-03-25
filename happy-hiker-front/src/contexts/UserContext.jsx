import React, {createContext, useState, useEffect, useContext} from "react";
import UserTokenContext from "./UserTokenContext"

export const UserContext = createContext()

export const UserInfoProvider = ({ children }) => {
    const { isAuthenticated } = useContext(UserTokenContext)
    const [userName, setUserName] = useState(null)
    const [userEmail, setUserEmail] = useState(null)

    useEffect(() => {
        if (!isAuthenticated) {
            setUserName("")
            setUserEmail("")
        }
    })

    useEffect(() => {
        if (isAuthenticated) {
            const fetchUserData = async () => {
                try {
                    //need to update url with backend - makes a GET request using token
                    const response = await fetch('need url', {
                        method: "GET",
                        headers: {
                            "Content-Type": 'application/json',
                            "Authorization": `Token ${sessionStorage.getItem("userToken")}`,
                        },
                    })
                // if the response is not ok throw an error and display issue
                if (!response.ok) {
                    throw new Error(`HTTP error! status: $response.status}`)
                }
                // may need to console.log body and see how information is returned
                // will set the username/email and with the provider we can share without drilling
                const body = await response.json()
                setUserName(body.username)
                setUserEmail(body.email)
                } catch (error) {
                    console.error('Error fetching data', error)
                }
            }
        //call function to run
        fetchUserData()
        }
        //causes this useEffect to only run once we authenticate 
    }, [isAuthenticated])

    return (
        <UserContext.Provider value={{ userName, userEmail, setUserEmail, setUserName }}>
            { children }
        </UserContext.Provider>
    )
} 


