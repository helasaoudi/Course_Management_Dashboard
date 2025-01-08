import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { db, doc, getDoc, collection, getDocs } from '../firebase'; // Firebase
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


function DetailsFormation({ formationId, onBack }) {
  const [formation, setFormation] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchFormationDetails = async () => {
      try {
        // Récupérer la formation avec la référence
        const formationDocRef = doc(db, 'Formation', formationId);  // référence à la formation
        const formationDoc = await getDoc(formationDocRef);
        if (formationDoc.exists()) {
          setFormation(formationDoc.data());
        }

        // Récupérer les sessions associées à cette formation
        const sessionsCollection = collection(db, 'Session');
        const sessionsSnapshot = await getDocs(sessionsCollection);
        const sessionsList = [];

        // Résoudre les références pour chaque session
        for (const docSnapshot of sessionsSnapshot.docs) {
          const sessionData = docSnapshot.data();
          const formationRef = sessionData.Formation; // référence à la formation

          if (formationRef && formationRef.id === formationId) {
            const session = {
              id: docSnapshot.id,
              ...sessionData,
            };

            // Résoudre la liste de formateurs (références)
            const formateursList = [];
            for (const formateurRef of session.formateurs) {
              const formateurDoc = await getDoc(formateurRef);  // récupération des données du formateur
              if (formateurDoc.exists()) {
                formateursList.push(formateurDoc.data().nom); // ajouter le nom du formateur
              }
            }
            session.formateurs = formateursList; // ajouter les formateurs à la session
            sessionsList.push(session); // ajouter la session à la liste
          }
        }

        setSessions(sessionsList);  // Mettre à jour l'état avec la liste des sessions

      } catch (error) {
        console.error("Erreur lors de la récupération des détails de la formation : ", error);
      }
    };

    fetchFormationDetails();
  }, [formationId]);

  return (
    <Box sx={{ padding: 3 }}>
          <IconButton onClick={onBack} sx={{ marginBottom: 2, color: 'primary.main' }}>
        <ArrowBackIcon />
      </IconButton>

      {formation && (
        <>
       
          <Box sx={{ marginTop: 3 }}>
            <Typography variant="h6" sx={{ textAlign: 'left' }}>Sessions :</Typography>

            {/* Tableau avec en-tête blanc */}
            <table className="table" style={{ borderRadius: '20px', overflow: 'hidden', width: '100%' }}>
              <thead className="Dark">
                <tr>
                  <th>Date de Début</th>
                  <th>Date de Fin</th>
                  <th>Nombre de candidats</th>
                  <th>Formateurs</th> {/* Ajouter une colonne pour les formateurs */}
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr key={index}>
                    <td>{session.date_deb}</td>
                    <td>{session.date_fin}</td>
                    <td>{session.max_candidates}</td>
                    <td>
                      {/* Afficher les formateurs associés à la session */}
                      {session.formateurs.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
               {/* Champs alignés à gauche */}
          <Typography   variant="h5" sx={{ textAlign: 'left', marginTop:10 }}> Titre De Formation :  {formation.Titre}</Typography>
          <Typography variant="body1" sx={{ textAlign: 'left' }}> Description : {formation.desc}</Typography>
          <Typography variant="body1" sx={{ textAlign: 'left' }}>Niveau: {formation.niveau}</Typography>
          <Typography variant="body1" sx={{ textAlign: 'left' }}>Programme: {formation.programme}</Typography>
          <Typography variant="body1" sx={{ textAlign: 'left' }}>Tag: {formation.tag}</Typography>

          </Box>

          {/* Bouton aligné à gauche */}
        
        </>
      )}
    </Box>
  );
}

export default DetailsFormation;
