import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const RegisterUserWithBackend = () => {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();

  useEffect(() => {
    const sendAuth0Id = async () => {
      try {
        const token = await getAccessTokenSilently();
        const decoded = jwtDecode(token);
        const auth0_id = decoded.sub;

        const name = user?.name;
        const email = user?.email;

        const response = await fetch("http://localhost:8000/user/register/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ auth0_id, name, email }),
        });

        const data = await response.json();
        console.log("Register response:", data);
      } catch (err) {
        console.error("Failed to send auth0_id", err);
      }
    };

    if (isAuthenticated) {
      sendAuth0Id();
    }
  }, [isAuthenticated, user]);

  return null;
};

export default RegisterUserWithBackend;
