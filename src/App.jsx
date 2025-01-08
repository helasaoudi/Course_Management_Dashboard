import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Dashboard/Home'; // Assurez-vous que le chemin est correct
import './App.css';
import { Auth } from './Dashboard/Auth';
import Dashboard from './Dashboard/Sidebar';
import SessionPage from './Dashboard/Session';
import Session from './Dashboard/Session';
import Candidat from './Dashboard/Condidat';
import FormationList from './Dashboard/Formation';
import Formateur from './Dashboard/Formateur';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="session/:cin" element={<Session />} /> {/* Paramètre dynamique :cin */}
        <Route path="/Candidats" element={<Candidat />} />
        <Route path="/formation" element={<FormationList />} />
        <Route path="/formateur" element={<Formateur />} />





      </Routes>
    </Router>
  );
}

export default App;
