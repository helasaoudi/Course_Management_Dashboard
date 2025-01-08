import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Select, InputLabel, FormControl, Grid, Paper, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { db, collection, getDocs, addDoc, doc } from '../firebase';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


function AddFormation({ onBack }) {
  const [categories, setCategories] = useState({});
  const [trainers, setTrainers] = useState({});
  const [loading, setLoading] = useState(false);

  const [newFormationData, setNewFormationData] = useState({
    Titre: '',
    desc: '',
    nb_horaire: '',
    niveau: '',
    programme: '',
    tag: '',
    cat: '',
    sessions: [{ date_deb: '', date_fin: '', max_candidates: '', trainer: '' }],
    image: '',
  });
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchTrainers();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesCollection = collection(db, 'Categorie');
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesList = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const categoriesMap = categoriesList.reduce((acc, category) => {
        acc[category.id] = category.libelle;
        return acc;
      }, {});
      setCategories(categoriesMap);
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories : ', error);
    }
  };

  const fetchTrainers = async () => {
    try {
      const trainersCollection = collection(db, 'Formateur');
      const trainersSnapshot = await getDocs(trainersCollection);
      const trainersList = trainersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const trainersMap = trainersList.reduce((acc, trainer) => {
        acc[trainer.id] = trainer.nom; // Ajustez selon les champs dans votre document Formateur
        return acc;
      }, {});
      setTrainers(trainersMap);
    } catch (error) {
      console.error('Erreur lors de la récupération des formateurs : ', error);
    }
  };

  const handleChange = (e) => {
    setNewFormationData({
      ...newFormationData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSessionChange = (index, e) => {
    const updatedSessions = [...newFormationData.sessions];
    updatedSessions[index][e.target.name] = e.target.value;
    setNewFormationData({ ...newFormationData, sessions: updatedSessions });
  };

  const handleAddSession = () => {
    setNewFormationData({
      ...newFormationData,
      sessions: [...newFormationData.sessions, { date_deb: '', date_fin: '', max_candidates: '', trainer: '' }],
    });
  };

  const handleRemoveSession = (index) => {
    const updatedSessions = newFormationData.sessions.filter((_, i) => i !== index);
    setNewFormationData({ ...newFormationData, sessions: updatedSessions });
  };

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
        setImage(data.data.url); // Stocker l'URL de l'image
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

  const handleSaveFormation = async () => {
    // Attendre que l'image soit téléchargée
    if (!image) {
      alert('Veuillez télécharger une image avant de sauvegarder.');
      return;
    }

    try {
      // Sauvegarder les sessions dans Firestore
      const sessionRefs = [];
      for (const session of newFormationData.sessions) {
        const sessionRef = await addDoc(collection(db, 'Session'), session);
        sessionRefs.push(sessionRef);
      }

      // Sauvegarder la formation avec l'URL de l'image
      await addDoc(collection(db, 'Formation'), {
        Titre: newFormationData.Titre,
        desc: newFormationData.desc,
        nb_horaire: newFormationData.nb_horaire,
        niveau: newFormationData.niveau,
        programme: newFormationData.programme,
        tag: newFormationData.tag,
        cat: doc(db, 'Categorie', newFormationData.cat),
        sessions: sessionRefs.map((ref) => ref),
        image: image, // Ajouter l'URL de l'image dans le champ image
      });

      // Réinitialiser les champs après sauvegarde
      setNewFormationData({
        Titre: '',
        desc: '',
        nb_horaire: '',
        niveau: '',
        programme: '',
        tag: '',
        cat: '',
        sessions: [{ date_deb: '', date_fin: '', max_candidates: '' }],
        image: '',
      });
      setImage(null);
        } catch (error) {
      console.error('Erreur lors de la sauvegarde de la formation : ', error);
    }
  };


  return (
    <Box sx={{ height: '100vh', overflowY: 'auto', padding: 3, backgroundColor: '#EDF4FB' }}>
      <IconButton onClick={onBack} sx={{ marginBottom: 2 }}>
      <ArrowBackIcon  />
      </IconButton>
      <Typography variant="h6" sx={{ mb: 3 }}>Ajouter une Formation</Typography>
      <Paper sx={{ p: 3, mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        {/* Formulaire principal */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField label="Titre" fullWidth name="Titre" value={newFormationData.Titre} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Description" fullWidth name="desc" value={newFormationData.desc} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Nombre d'heures" type="number" fullWidth name="nb_horaire" value={newFormationData.nb_horaire} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Niveau" fullWidth name="niveau" value={newFormationData.niveau} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={4}>
          <Button variant="contained" component="label" fullWidth sx={{ marginBottom: 2 }}>
                   Télécharger la Photo
                   <input type="file" hidden onChange={handleImageUpload} />
                 </Button>
                  {image && <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
                    Photo téléchargée: <a href={image} target="_blank" rel="noopener noreferrer">Voir l'image</a>
                  </Typography>}
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Tag" fullWidth name="tag" value={newFormationData.tag} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select value={newFormationData.cat} name="cat" onChange={handleChange}>
                {Object.keys(categories).map((id) => (
                  <MenuItem key={id} value={id}>{categories[id]}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <ReactQuill theme="snow" value={newFormationData.programme} onChange={(value) => setNewFormationData({ ...newFormationData, programme: value })} placeholder="Programme" />

      <Paper sx={{ p: 3, mt: 3, backgroundColor: 'white' }}>
        <Typography variant="h6">Sessions</Typography>
        {newFormationData.sessions.map((session, index) => (
          <Box key={index} sx={{ padding: 2, marginBottom: 2 }}>
            <TextField  sx={{ padding: 2}} label="Date début" type="date" fullWidth InputLabelProps={{ shrink: true }} name="date_deb" value={session.date_deb} onChange={(e) => handleSessionChange(index, e)} />
            <TextField  sx={{ padding: 2}} label="Date fin" type="date" fullWidth InputLabelProps={{ shrink: true }} name="date_fin" value={session.date_fin} onChange={(e) => handleSessionChange(index, e)} />
            <TextField sx={{ padding: 2}} label=" &nbsp;&nbsp;Nombre maximal" type="number" fullWidth name="max_candidates" value={session.max_candidates} onChange={(e) => handleSessionChange(index, e)} />
            <FormControl fullWidth sx={{ padding: 2}}>
              <InputLabel > &nbsp;&nbsp;Formateur</InputLabel>
              <Select value={session.trainer} name="trainer" onChange={(e) => handleSessionChange(index, e)}>
                {Object.keys(trainers).map((id) => (
                  <MenuItem key={id} value={id}>{trainers[id]}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button onClick={() => handleRemoveSession(index)}><DeleteIcon /></Button>
          </Box>
        ))}
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddSession}>Ajouter Session</Button>
      </Paper>

      <Box sx={{ textAlign: 'center', marginTop: 6 , marginBottom:8 }}>
        <Button variant="contained" color="primary" onClick={handleSaveFormation}>Sauvegarder</Button>
      </Box>
    </Box>
  );
}

export default AddFormation;
