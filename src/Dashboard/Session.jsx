import React from 'react';
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Session({ candidat, onBackClick }) {
  if (!candidat) {
    return <p>Chargement des informations du candidat...</p>;
  }

  return (
    <Box sx={{ padding: 3 }}>
      {/* Bouton de retour */}
      <IconButton onClick={onBackClick} sx={{ marginBottom: 2, color: 'primary.main' }}>
        <ArrowBackIcon />
      </IconButton>

      {/* Titre */}
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Détails des sessions de {candidat.nom}
      </Typography>

      {/* Tableau amélioré */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Date début</strong></TableCell>
              <TableCell><strong>Date fin</strong></TableCell>
              <TableCell><strong>Max candidats</strong></TableCell>
              <TableCell><strong>Formation</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidat.sessions.map((session, index) => (
              <TableRow key={index}>
                <TableCell>{session.date_deb}</TableCell>
                <TableCell>{session.date_fin}</TableCell>
                <TableCell>{session.max_candidates}</TableCell>
                <TableCell>{session.formation || 'Non spécifiée'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Session;
