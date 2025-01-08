// Auth.jsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, TextField, Button, FormControlLabel, Checkbox } from "@mui/material";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "./Auth.css";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Applique l'arrière-plan à la page de connexion uniquement
    document.body.style.backgroundImage = "url('/assets/login1.jpg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.minHeight = "100vh";  // Prend toute la hauteur de l'écran

    return () => {
      // Nettoie l'arrière-plan lorsque le composant Auth est démonté
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundRepeat = "";
      document.body.style.minHeight = "";
    };
  }, []);

 /* useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard"); // Redirige vers le tableau de bord si l'utilisateur est connecté
      }
    });
    return () => unsubscribe();
  }, [navigate]);*/

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login Successful!");
      navigate("/dashboard");
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          setError("No user found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        default:
          setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <Card style={{ maxWidth: 400, margin: "2rem auto", padding: "1rem", alignItems:"center", opacity: 0.9, backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Login
          </Typography>
          {error && (
            <Typography color="error" style={{ marginBottom: "1rem" }}>
              {error}
            </Typography>
          )}
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              variant="outlined"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: "1rem" }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginBottom: "1rem" }}
            />
            <FormControlLabel control={<Checkbox />} label="Remember me" />
            <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: "1rem", backgroundColor: "#145074" }}>
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
