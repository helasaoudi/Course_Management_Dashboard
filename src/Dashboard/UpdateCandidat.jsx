import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function UpdateCandidat({ open, onClose, candidat, onUpdate }) {
  const [formData, setFormData] = useState({
    cin: '',
    nom: '',
    prenom: '',
    email: '',
  });

  // Mettre à jour les données du formulaire chaque fois que 'candidat' change
  useEffect(() => {
    if (candidat) {
      setFormData({
        cin: candidat.cin || '',
        nom: candidat.nom || '',
        prenom: candidat.prenom || '',
        email: candidat.email || '',
      });
    }
  }, [candidat]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      const candidatRef = doc(db, 'Candidat', candidat.id); // Référence au document
      await updateDoc(candidatRef, formData); // Mettre à jour Firestore
      alert('Candidat mis à jour avec succès.');
      onUpdate(); // Rafraîchir la liste des candidats
      onClose(); // Fermer le modal
    } catch (error) {
      console.error('Erreur lors de la mise à jour du candidat :', error);
      alert('Une erreur s\'est produite lors de la mise à jour.');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Modifier le candidat
        </Typography>
        <TextField
          label="CIN"
          name="cin"
          value={formData.cin}
          onChange={handleInputChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Nom"
          name="nom"
          value={formData.nom}
          onChange={handleInputChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Prénom"
          name="prenom"
          value={formData.prenom}
          onChange={handleInputChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleUpdate}>
            Enregistrer
          </Button>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Annuler
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default UpdateCandidat;
