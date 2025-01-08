import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Select, MenuItem, IconButton, Box, Typography } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { storage, db, collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from '../firebase'; // Assurez-vous d'importer les fonctions Firebase nécessaires
import { ref, getDownloadURL } from 'firebase/storage';

const Formateur = () => {
  const [formateurs, setFormateurs] = useState([]);
  const [specialites, setSpecialites] = useState([""]); // Exemple de spécialités
  const [photoUrls, setPhotoUrls] = useState({}); // Stocker les URLs des photos pour chaque formateur

  // Récupérer les formateurs depuis Firestore
  useEffect(() => {
    const fetchFormateurs = async () => {
      const querySnapshot = await getDocs(collection(db, 'Formateur'));
      const formateursData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setFormateurs(formateursData);
    };

    fetchFormateurs();
  }, []);

  // Récupérer les photos des formateurs
  useEffect(() => {
    const fetchPhotos = async () => {
      const newPhotoUrls = {};
      for (const formateur of formateurs) {
        if (formateur.photo) {
          try {
            const photoUrl = await getDownloadURL(ref(storage, formateur.photo));
            newPhotoUrls[formateur.id] = photoUrl;
          } catch (error) {
            console.error('Error fetching photo: ', error);
          }
        }
      }
      setPhotoUrls(newPhotoUrls);
    };

    if (formateurs.length > 0) {
      fetchPhotos();
    }
  }, [formateurs]);

  // Gérer la suppression d'un formateur
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'Formateur', id));
      setFormateurs(formateurs.filter(formateur => formateur.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  // Gérer la modification d'un formateur
  const handleEdit = async (id, newSpecialite) => {
    if (newSpecialite) {
      const formateurRef = doc(db, 'Formateur', id);
      await updateDoc(formateurRef, { specialite: newSpecialite });
      setFormateurs(formateurs.map(formateur => formateur.id === id ? { ...formateur, specialite: newSpecialite } : formateur));
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Liste des Formateurs</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>CV</TableCell>
              <TableCell>Spécialité</TableCell>
              <TableCell>Photo</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formateurs.map((formateur) => (
              <TableRow key={formateur.id}>
                <TableCell>{formateur.nom} {formateur.prenom}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    href={formateur.cv} // Assurez-vous que le CV est un lien vers le PDF dans Firebase Storage
                    target="_blank"
                  >
                    Télécharger CV
                  </Button>
                </TableCell>
                <TableCell>
                  <Select
                    value={formateur.specialite || ''}
                    onChange={(e) => handleEdit(formateur.id, e.target.value)} // Modifier la spécialité
                  >
                    {specialites.map((specialite, index) => (
                      <MenuItem key={index} value={specialite}>{specialite}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  {photoUrls[formateur.id] && (
                    <img
                      src={photoUrls[formateur.id]}
                      alt="Photo du formateur"
                      style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(formateur.id, formateur.specialite)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(formateur.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Formateur;
