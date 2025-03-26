import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import UserTokenContext from "../contexts/UserTokenContext";


export default function UserProfileComponent() {
    const { setUsername, userName, } = useContext(UserContext)
    const { token } = useContext(UserTokenContext)

    useEffect(() => {
        if (token) {
            const fetchUserData = async () => {
                try {
                    const response = await fetch("need url" , {
                        method: 'GET',
                        headers: {
                            "Content-Type" : "application/json:",
                            "Authorization": `Token ${token}`,
                        },
                    })
                    const body = await response.json()
                    if (body) {
                        console.log(body)
                        setUsername(body.name)
                        // pull the info and set it as the state
                    }
                } catch (error) {
                    console.error("Error in fetchUserData:", error)
                }
            }
            fetchUserData()
        } else {
            console.error("NO TOKEN FOUND")
        }
    }, [token])

    return (
        <div style={{display:"flex", flexDirection:"column", alignItems:"center", background:"#F5F5DC"}}>
            <h1> User info! --- will be username once we get the token to import </h1>
                <div style={{border:"2px solid black"}}>
                    <h2 style={{textDecoration:"underline"}}> Favorite Trails </h2>
                        <ul>
                            <li>trail one</li>    
                            <li>trail two</li>    
                            <li>trail three</li>    
                        </ul>
                </div>
        </div>

    )
}

