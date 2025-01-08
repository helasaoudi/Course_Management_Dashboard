import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, getDoc, deleteDoc, doc } from '../firebase'; // Firebase
import { Box, Typography } from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add'; // Importer l'icône "+"
import AddCandidat from './AddCandidat'; // Importer le composant AddCandidat
import UpdateCandidat from './UpdateCandidat'; // Importer le composant UpdateCandidat
import 'bootstrap/dist/css/bootstrap.min.css';
import Session from './Session';
import ImageIcon from '@mui/icons-material/Image'; // Icône d'image

Session
// Fonction principale
function Candidat() {
  const [candidats, setCandidats] = useState([]);
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [candidatToUpdate, setCandidatToUpdate] = useState(null);

  // Fonction pour récupérer les informations de session associées à un candidat
  const fetchSession = async (sessionRef) => {
    const sessionDoc = await getDoc(sessionRef);
    if (sessionDoc.exists()) {
      const sessionData = sessionDoc.data();
      if (sessionData.Formation && sessionData.Formation.id) {
        const formationRef = sessionData.Formation;
        const formationDoc = await getDoc(formationRef);
        if (formationDoc.exists()) {
          sessionData.Formation = formationDoc.data();
        }
      }
      return sessionData;
    }
    return null;
  };

  // Fonction pour récupérer tous les candidats
  const fetchCandidats = async () => {
    const candidatsSnapshot = await getDocs(collection(db, 'Candidat'));
    const candidatsList = [];
    for (const docSnap of candidatsSnapshot.docs) {
      const candidat = { id: docSnap.id, ...docSnap.data() };
      const sessionsDetails = [];
      if (candidat.sessions && Array.isArray(candidat.sessions)) {
        for (const sessionRef of candidat.sessions) {
          const sessionData = await fetchSession(sessionRef);
          if (sessionData) {
            sessionsDetails.push(sessionData);
          }
        }
      }
      candidatsList.push({ ...candidat, sessions: sessionsDetails });
    }
    setCandidats(candidatsList);
  };

  useEffect(() => {
    fetchCandidats();
  }, []);

  // Gestion des clics
  const handleSessionClick = (candidat) => {
    const simplifiedSessions = candidat.sessions.map(session => ({
      date_deb: session.date_deb,
      max_candidates: session.max_candidates,
      date_fin: session.date_fin,
      formation: session.Formation ? session.Formation.Titre : 'Non spécifié',
    }));
    setSelectedCandidat({ ...candidat, sessions: simplifiedSessions });
  };

  const handleDeleteCandidat = async (candidatId) => {
    const confirmation = window.confirm('Voulez-vous vraiment supprimer ce candidat ?');
    if (confirmation) {
      try {
        await deleteDoc(doc(db, 'Candidat', candidatId));
        alert('Candidat supprimé avec succès.');
        fetchCandidats();
      } catch (error) {
        console.error('Erreur lors de la suppression du candidat :', error);
        alert('Une erreur s\'est produite lors de la suppression.');
      }
    }
  };

  const handleBackClick = () => setSelectedCandidat(null);
  const handleAddCandidatClick = () => setOpenModal(true);
  const handleAddCandidat = () => fetchCandidats();

  const handleEditCandidatClick = (candidat) => {
    setCandidatToUpdate(candidat);
    setOpenUpdateModal(true);
  };

  // Affichage de la session
  if (selectedCandidat) {
    return <Session candidat={selectedCandidat} onBackClick={handleBackClick} />;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2, color: 'gray' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Typography variant="h6">Liste des Candidats</Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: 'skyblue',
            cursor: 'pointer',
          }}
          onClick={handleAddCandidatClick}
        >
          <AddIcon sx={{ color: 'white' }} />
        </Box>
      </Box>
      <table className="table" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <thead className="table-primary">
          <tr>
            <th>CIN</th>
            <th>Photo</th> {/* Nouvelle colonne Photo */}
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Sessions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidats.map((candidat, index) => (
            <tr key={index}>
              <td>{candidat.cin}</td>
              <td>
                {candidat.photo ? (
                  <img
                    src={candidat.photo}
                    alt="Candidat"
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  <ImageIcon sx={{ color: '#b0bec5' }} /> // Icône claire si pas de photo
                )}
              </td>
              <td>{candidat.nom}</td>
              <td>{candidat.prenom}</td>
              <td>{candidat.email}</td>
              <td>
                <BookIcon
                  sx={{ cursor: 'pointer', color: 'green' }}
                  onClick={() => handleSessionClick(candidat)}
                />
              </td>
              <td>
                <EditIcon
                  sx={{ cursor: 'pointer', color: 'blue', marginRight: 2 }}
                  onClick={() => handleEditCandidatClick(candidat)}
                />
                <DeleteIcon
                  sx={{ cursor: 'pointer', color: 'red' }}
                  onClick={() => handleDeleteCandidat(candidat.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal pour ajouter un candidat */}
      <AddCandidat
        open={openModal}
        onClose={() => setOpenModal(false)}
        onAddCandidat={handleAddCandidat}
      />

      {/* Modal pour mettre à jour un candidat */}
      <UpdateCandidat
        open={openUpdateModal}
        onClose={() => setOpenUpdateModal(false)}
        candidat={candidatToUpdate}
        onUpdate={fetchCandidats}
      />
    </Box>
  );
}

export default Candidat;
