import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    console.log("Login button clicked");
    loginWithRedirect()
      .then(() => {
        console.log("Redirect should have started...");
      })
      .catch((error) => {
        console.error("Error in loginWithRedirect:", error);
      });
  };

  return <button onClick={handleLogin}>Log In</button>;
};

export default LoginButton;
