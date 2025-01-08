import React, { useState } from 'react';
import { Box, TextField, Button, Modal, Typography } from '@mui/material';
import { db, collection, addDoc } from '../firebase'; // Firebase
import { useSnackbar } from 'notistack'; // Pour les notifications de succès ou d'erreur

const AddCandidat = ({ open, onClose, onAddCandidat }) => {
  const { enqueueSnackbar } = useSnackbar(); // Pour les notifications
  const [cin, setCin] = useState('');
  const [email, setEmail] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fonction pour gérer l'upload de l'image
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    console.log('Fichier sélectionné:', file);

    if (!file) {
      enqueueSnackbar('Aucun fichier sélectionné.', { variant: 'warning' });
      return;
    }

    // Vérification du type de fichier
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Veuillez sélectionner une image.', { variant: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    console.log('FormData avant envoi:', formData);

    try {
      setLoading(true);
      console.log('Démarrage de l\'upload de l\'image...');

      // Envoi de l'image vers ImgBB
      const response = await fetch('https://api.imgbb.com/1/upload?key=20a090696d9886faf9f1978bb37c0a0c', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Réponse ImgBB:', data);

      if (data.success) {
        setPhoto(data.data.url); // Stocker l'URL de l'image
        enqueueSnackbar('Image téléchargée avec succès!', { variant: 'success' });
      } else {
        enqueueSnackbar('Erreur de téléchargement de l\'image.', { variant: 'error' });
        console.log('Erreur de téléchargement:', data.error);
      }
    } catch (error) {
      console.log('Erreur de téléchargement:', error);
      enqueueSnackbar('Erreur de téléchargement de l\'image.', { variant: 'error' });
    } finally {
      setLoading(false);
      console.log('Fin de l\'upload de l\'image');
    }
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async () => {
    // Vérification des champs
    if (!cin || !email || !nom || !prenom || !password || !photo) {
      enqueueSnackbar('Tous les champs doivent être remplis.', { variant: 'warning' });
      return;
    }

    // Ajouter le candidat dans la base de données
    try {
      const docRef = await addDoc(collection(db, 'Candidat'), {
        cin,
        email,
        nom,
        prenom,
        password,
        photo,
      });
      console.log('Candidat ajouté avec ID:', docRef.id);
      enqueueSnackbar('Candidat ajouté avec succès!', { variant: 'success' });
      onAddCandidat(); // Mise à jour de la liste des candidats après ajout
      onClose(); // Fermer le modal après la soumission
    } catch (error) {
      console.error('Erreur d\'ajout du candidat:', error);
      enqueueSnackbar('Erreur d\'ajout du candidat.', { variant: 'error' });
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
          padding: 4,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" align="center" gutterBottom>
          Ajouter un Candidat
        </Typography>

        <TextField
          label="CIN"
          fullWidth
          value={cin}
          onChange={(e) => setCin(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Nom"
          fullWidth
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Prénom"
          fullWidth
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Mot de passe"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Button variant="contained" component="label" fullWidth sx={{ marginBottom: 2 }}>
          Télécharger la Photo
          <input type="file" hidden onChange={handleImageUpload} />
        </Button>
        {photo && <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
          Photo téléchargée: <a href={photo} target="_blank" rel="noopener noreferrer">Voir l'image</a>
        </Typography>}

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ width: '48%' }}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ width: '48%' }}
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddCandidat;
