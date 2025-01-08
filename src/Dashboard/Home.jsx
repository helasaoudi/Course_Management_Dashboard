import React, { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../firebase'; // Assurez-vous d'importer correctement les fonctions Firestore
import { Line } from 'react-chartjs-2'; // Importation du graphique
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Enregistrement des composants de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Home = () => {
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [trainersCount, setTrainersCount] = useState(0);
  const [trainingsCount, setTrainingsCount] = useState(0);
  const [sessionsData, setSessionsData] = useState([]);
  const [trainingsData, setTrainingsData] = useState([]);

  useEffect(() => {
    // Fonction pour récupérer les données depuis Firestore
    const fetchData = async () => {
      const candidatesSnapshot = await getDocs(collection(db, 'Candidat'));
      const trainersSnapshot = await getDocs(collection(db, 'Formateur'));
      const trainingsSnapshot = await getDocs(collection(db, 'Formation'));
      
      // Supposons que chaque session a un champ `candidats` pour le nombre de candidats inscrits
      // et chaque formation a un champ `sessions` pour le nombre de sessions programmées.
      const sessionsRef = collection(db, 'Session');
      const sessionsSnapshot = await getDocs(sessionsRef);
      const sessionsCounts = sessionsSnapshot.docs.map(doc => doc.data().candidats ? doc.data().candidats.length : 0);
      
      const formationsRef = collection(db, 'Formation');
      const formationsSnapshot = await getDocs(formationsRef);
      const formationsCounts = formationsSnapshot.docs.map(doc => doc.data().sessions ? doc.data().sessions.length : 0);
      
      setCandidatesCount(candidatesSnapshot.size);
      setTrainersCount(trainersSnapshot.size);
      setTrainingsCount(trainingsSnapshot.size);
      setSessionsData(sessionsCounts);
      setTrainingsData(formationsCounts);
    };

    fetchData();
  }, []);

  // Configuration du graphique des candidats par session
  const candidatesChartData = {
    labels: Array.from({ length: sessionsData.length }, (_, i) => `Session ${i + 1}`),
    datasets: [
      {
        label: 'Nombre de Candidats par Session',
        data: sessionsData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4, // Animation lisse
      },
    ],
  };

  // Configuration du graphique des sessions programmées par formation
  const trainingsChartData = {
    labels: Array.from({ length: trainingsData.length }, (_, i) => `Formation ${i + 1}`),
    datasets: [
      {
        label: 'Nombre de Sessions par Formation',
        data: trainingsData,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
        tension: 0.4, // Animation lisse
      },
    ],
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', height: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Dashboard</h1>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Carte pour le nombre de candidats */}
        <div
          style={{
            width: '250px',
            height: '150px',
            borderRadius: '10px',
            backgroundColor: '#FFCDD2', // Rose clair
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            color: '#fff',
            fontSize: '20px',
            textAlign: 'center'
          }}
        >
          <h3>Total Candidats</h3>
          <p>{candidatesCount}</p>
        </div>

        {/* Carte pour le nombre de formateurs */}
        <div
          style={{
            width: '250px',
            height: '150px',
            borderRadius: '10px',
            backgroundColor: '#C8E6C9', // Vert clair
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            color: '#333',
            fontSize: '20px',
            textAlign: 'center'
          }}
        >
          <h3>Total Formateurs</h3>
          <p>{trainersCount}</p>
        </div>

        {/* Carte pour le nombre de formations */}
        <div
          style={{
            width: '250px',
            height: '150px',
            borderRadius: '10px',
            backgroundColor: '#FFEB3B', // Jaune clair
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            color: '#333',
            fontSize: '20px',
            textAlign: 'center'
          }}
        >
          <h3>Total Formations</h3>
          <p>{trainingsCount}</p>
        </div>
      </div>

      {/* Graphique des candidats inscrits par session */}
      <div style={{ marginBottom: '40px', textAlign: 'center', width: '80%' }}>
        <h2>Nombre de Candidats Inscrits par Session</h2>
        <div style={{ height: '400px' }}>
          <Line data={candidatesChartData} options={{ animation: { duration: 1000 } }} />
        </div>
      </div>

      {/* Graphique des sessions programmées par formation */}
      <div style={{ marginBottom: '40px', textAlign: 'center', width: '80%' }}>
        <h2>Nombre de Sessions Programmées par Formation</h2>
        <div style={{ height: '400px' }}>
          <Line data={trainingsChartData} options={{ animation: { duration: 1000 } }} />
        </div>
      </div>

      {/* Résumé des totaux */}
     
    </div>
  );
};

export default Home;
