import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { db, collection, getDocs, deleteDoc, doc } from '../firebase'; // Firebase
import DetailsFormation from './DetailsFormation';
import AddFormation from './AddFormation';
import UpdateFormation from './UpdateFormation'; // Nouveau composant pour l'édition
import AddIcon from '@mui/icons-material/Add';

function FormationList() {
  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [showAddFormation, setShowAddFormation] = useState(false);
  const [updateFormationId, setUpdateFormationId] = useState(null); // ID de la formation à éditer
  const [currentComponent, setCurrentComponent] = useState('list'); // Ajout de l'état currentComponent

  const fetchFormations = async () => {
    try {
      const formationsCollection = collection(db, 'Formation');
      const formationsSnapshot = await getDocs(formationsCollection);
      const formationsList = formationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFormations(formationsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des formations : ", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesCollection = collection(db, 'Categorie');
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesList = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const categoriesMap = categoriesList.reduce((acc, category) => {
        acc[category.id] = category.libelle;
        return acc;
      }, {});
      setCategories(categoriesMap);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories : ", error);
    }
  };

  useEffect(() => {
    fetchFormations();
    fetchCategories();
  }, []);

  const handleViewDetails = (formationId) => {
    setSelectedFormation(formationId);
    setCurrentComponent('details'); // Met à jour l'état pour afficher DetailsFormation
  };

  const handleBackToList = () => {
    setSelectedFormation(null);
    setShowAddFormation(false);
    setUpdateFormationId(null);
    setCurrentComponent('list'); // Retour à la liste
  };

  const handleAddIconClick = () => {
    setShowAddFormation(true);
    setCurrentComponent('add'); // Met à jour l'état pour afficher AddFormation
  };

  const handleEdit = (formationId) => {
    setUpdateFormationId(formationId); // Définir l'ID de la formation à éditer
    setCurrentComponent('update'); // Met à jour l'état pour afficher UpdateFormation
  };

  const handleDeleteFormation = async (formationId) => {
    const confirmDelete = window.confirm('Voulez-vous vraiment supprimer cette formation et ses sessions ?');
    if (confirmDelete) {
      try {
        const formationDocRef = doc(db, 'Formation', formationId);
        await deleteDoc(formationDocRef);
        alert('Formation supprimée avec succès!');
        fetchFormations();
      } catch (error) {
        console.error('Erreur lors de la suppression de la formation : ', error);
        alert('Une erreur s\'est produite lors de la suppression.');
      }
    }
  };

  // Gestion de l'affichage en fonction du composant actuel
  if (currentComponent === 'add') {
    return <AddFormation onBack={handleBackToList} />;
  }

  if (currentComponent === 'details') {
    return <DetailsFormation formationId={selectedFormation} onBack={handleBackToList} />;
  }

  if (currentComponent === 'update') {
    return (
      <UpdateFormation
        formationId={updateFormationId}
        onUpdate={fetchFormations} // Met à jour la liste après modification
        onBack={handleBackToList} // Retour à la liste
      />
    );
  }

  // Affichage de la liste des formations
  return (
    <Box sx={{ flexGrow: 1, p: 2, color: 'gray' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Typography variant="h6">Liste des Formations</Typography>
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
          onClick={handleAddIconClick}
        >
          <AddIcon sx={{ color: 'white' }} />
        </Box>
      </Box>

      <table className="table" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <thead className="table-primary">
          <tr>
            <th>Titre</th>
            <th>Catégorie</th>
            <th>Horaire</th>
            <th>Niveau</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {formations.map((formation, index) => {
            const categoryLabel = categories[formation.cat?.id];
            return (
              <tr key={index}>
                <td>{formation.Titre}</td>
                <td>{categoryLabel || 'Catégorie inconnue'}</td>
                <td>{formation.nb_horaire}</td>
                <td>{formation.niveau}</td>
                <td>
                  <EditIcon
                    sx={{ cursor: 'pointer', color: '#90caf9', marginRight: 2 }}
                    onClick={() => handleEdit(formation.id)} // Lors du clic sur l'icône, affiche le composant UpdateFormation
                  />
                  <DeleteIcon
                    sx={{ cursor: 'pointer', color: '#ffab91', marginRight: 2 }}
                    onClick={() => handleDeleteFormation(formation.id)}
                  />
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#a5d6a7',
                      color: 'white',
                      '&:hover': { backgroundColor: '#81c784' },
                    }}
                    onClick={() => handleViewDetails(formation.id)}
                  >
                    Voir Détail
                    <VisibilityIcon sx={{ marginLeft: 1 }} />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
}

export default FormationList;
