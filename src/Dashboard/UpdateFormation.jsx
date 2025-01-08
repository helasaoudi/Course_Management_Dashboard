import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Modal, Typography, FormControl, InputLabel, Select, MenuItem, Grid, IconButton, Checkbox, ListItemText } from '@mui/material';
import { db, doc, updateDoc, getDoc, collection, query, where, getDocs } from '../firebase'; // Firebase
import { useSnackbar } from 'notistack'; // Notifications
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { storage } from '../firebase'; // Firebase Storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AddIcon from '@mui/icons-material/Add';

const UpdateFormation = ({ formationId, onUpdate, onBack }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [formateur, setFormateur] = useState([]); // Formateur now stores an array
  const [sessions, setSessions] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState({});
  const [trainers, setTrainers] = useState({});

  useEffect(() => {
    const fetchFormationData = async () => {
      if (!formationId) return;

      try {
        const formationDoc = await getDoc(doc(db, 'Formation', formationId));
        if (formationDoc.exists()) {
          const data = formationDoc.data();
          setTitle(data.Titre || '');
          setDescription(data.Description || '');
          setDuration(data.nb_horaire || '');

          // Vérifier si les sessions existent, sinon initialiser à un tableau vide
          const sessionsData = data.sessions || [{ date_deb: '', date_fin: '', max_candidates: '', trainer: [] }];
          setSessions(sessionsData);

          setFormateur(data.formateur || []); // Assurez-vous que formateur est un tableau
          console.log('Formation data loaded:', data);
        } else {
          enqueueSnackbar('Formation introuvable.', { variant: 'error' });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de la formation:', error);
        enqueueSnackbar('Erreur lors du chargement des données.', { variant: 'error' });
      }
    };

    const fetchCategoriesAndTrainers = async () => {
      try {
        // Récupérer les catégories et formateurs de Firestore
        const categoriesSnapshot = await getDocs(collection(db, 'Categories'));
        const categoriesMap = categoriesSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().name;
          return acc;
        }, {}); 
        setCategories(categoriesMap);

        const trainersSnapshot = await getDocs(collection(db, 'Formateur'));
        const trainersMap = trainersSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().name;
          return acc;
        }, {}); 
        setTrainers(trainersMap);
      } catch (error) {
        console.error('Error fetching categories or trainers:', error);
      }
    };

    fetchFormationData();
    fetchCategoriesAndTrainers();
  }, [formationId, enqueueSnackbar]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageRef = ref(storage, `images/${file.name}`);
      uploadBytes(imageRef, file).then(() => {
        getDownloadURL(imageRef).then((url) => {
          setImage(url);
        });
      });
    }
  };

  const handleSessionChange = (index, event) => {
    const updatedSessions = [...sessions];
    updatedSessions[index][event.target.name] = event.target.value;
    setSessions(updatedSessions);
  };

  const handleAddSession = () => {
    setSessions([...sessions, { date_deb: '', date_fin: '', max_candidates: '', trainer: [] }]); // Ensure trainer is an array for multiple selection
  };

  const handleRemoveSession = (index) => {
    const updatedSessions = sessions.filter((_, i) => i !== index);
    setSessions(updatedSessions);
  };

  const handleSubmit = async () => {
    if (!title || !description || !duration || formateur.length === 0) {
      enqueueSnackbar('Tous les champs doivent être remplis.', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, 'Formation', formationId), {
        Titre: title,
        Description: description,
        nb_horaire: duration,
        formateur,
        sessions,
        image,
      });

      // Si formateur a changé, mettre à jour les sessions avec le formateur
      for (const session of sessions) {
        await updateDoc(doc(db, 'Session', session.id), {
          trainer: session.trainer,
        });
      }

      enqueueSnackbar('Formation mise à jour avec succès!', { variant: 'success' });
      onUpdate(); // Mettre à jour la liste des formations
      onBack(); // Retour à la liste des formations
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      enqueueSnackbar('Erreur lors de la mise à jour de la formation.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', overflowY: 'auto', padding: 3, backgroundColor: '#EDF4FB' }}>
      <IconButton onClick={onBack} sx={{ marginBottom: 2 }}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h6" sx={{ mb: 3 }}>Modifier une Formation</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField label="Titre" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField label="Description" fullWidth value={description} onChange={(e) => setDescription(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label="Nombre d'heures" type="number" fullWidth value={duration} onChange={(e) => setDuration(e.target.value)} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Button variant="contained" component="label" fullWidth>
            Télécharger l'image
            <input type="file" hidden onChange={handleImageUpload} />
          </Button>
          {image && <Typography variant="body2" color="textSecondary">Image téléchargée: <a href={image} target="_blank" rel="noopener noreferrer">Voir l'image</a></Typography>}
        </Grid>
      </Grid>

      <Box sx={{ marginTop: 3 }}>
        <Typography variant="h6">Sessions</Typography>
        {sessions.map((session, index) => (
          <Box key={index} sx={{ marginBottom: 2 }}>
            <TextField label="Date début" type="date" fullWidth name="date_deb" value={session.date_deb} onChange={(e) => handleSessionChange(index, e)} />
            <TextField label="Date fin" type="date" fullWidth name="date_fin" value={session.date_fin} onChange={(e) => handleSessionChange(index, e)} />
            <TextField label="Nombre maximal" type="number" fullWidth name="max_candidates" value={session.max_candidates} onChange={(e) => handleSessionChange(index, e)} />
            <FormControl fullWidth>
              <InputLabel>Formateur</InputLabel>
              <Select
                multiple
                value={session.formateurs}
                onChange={(e) => handleSessionChange(index, e)}
                renderValue={(selected) => selected.map(id => formateurs[id]).join(', ')}
              >
                {Object.keys(formateurs).map((id) => (
                  <MenuItem key={id} value={id}>
                    <Checkbox checked={session.formateurs.indexOf(id) > -1} />
                    <ListItemText primary={formateurs[id]} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button onClick={() => handleRemoveSession(index)}>Supprimer</Button>
          </Box>
        ))}
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddSession}>Ajouter Session</Button>
      </Box>

      <Box sx={{ textAlign: 'center', marginTop: 6 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Mise à jour...' : 'Mettre à jour'}
        </Button>
      </Box>
    </Box>
  );
};

export default UpdateFormation;
