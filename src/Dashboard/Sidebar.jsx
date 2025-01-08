import * as React from 'react';
import { extendTheme, styled } from '@mui/material/styles';
import { Card, CardContent, Box, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import Candidat from './Condidat';
import Home from './Home'; 
import "../App.css";
import Session from './Session';
import FormationList from './Formation';
import Formateur from './Formateur';




const NAVIGATION = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    segment: 'Home',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'Candidats',
    title: 'Candidats',
    icon: <ShoppingCartIcon />,
  },
  {
    segment: 'Formation',  // Ajouter un segment pour la page de session
    title: 'Formation',
    icon: <ShoppingCartIcon />,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: '',
  },
  {
    segment: 'formateur',
    title: 'Formateur',
    icon: <BarChartIcon />,
  },
  {
    segment: 'Candidat',
    title: 'Integrations',
    icon: <LayersIcon />,
  },
];

const demoTheme = extendTheme({
  colorSchemes: { light: true, dark: true },
  colorSchemeSelector: 'class',
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function useDemoRouter(initialPath) {
  const [pathname, setPathname] = React.useState(initialPath);

  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  return router;
}

const COMPONENT_MAP = {
  dashboard: Home,
  Candidats: Candidat,
  reports: Home,
  integrations: Home,
  Formation: FormationList, 
  formateur: Formateur,
};


// Styles personnalisés pour le conteneur du Dashboard
const DashboardContainer = styled('div')(({ theme }) => ({
  backgroundColor: '#f5fafa', // Couleur de fond bleu ciel
  paddingTop: '2rem', // Espacement en haut
  paddingLeft: '3rem', // Décalage vers la droite
  paddingRight: '3rem',
  paddingBottom: '2rem', // Espacement en bas
  minHeight: '100vh', // Assurer que le contenu prend toute la hauteur de l'écran
  display: 'flex',
  justifyContent: 'center', // Centrer horizontalement
  alignItems: 'center', // Centrer verticalement
}));

// Style de la carte
const StyledCard = styled(Card)(({ theme }) => ({
  width: '99%', // Carte occupe 90% de la largeur
  height: '95vh', // La carte occupe 95% de la hauteur
  backgroundColor: 'white', // Fond de la carte en blanc
  boxShadow: theme.shadows[3], // Ombre légère pour la carte
  borderRadius: '10px', // Coins arrondis
  padding: theme.spacing(1), // Espacement intérieur
  marginTop: '-1%', // Décalage vers le hau
}));

export default function DashboardLayoutBasic(props) {
  const { window } = props;
  const router = useDemoRouter('/dashboard');
  const demoWindow = window ? window() : undefined;

  const handleNavigation = (segment) => {
    router.navigate(`/${segment}`);
  };
  console.log(router.pathname); 
  const CurrentComponent = COMPONENT_MAP[router.pathname.slice(1)] || Home;

  return (
    <AppProvider
      navigation={NAVIGATION.map((item) =>
        item.segment
          ? {
              ...item,
              onClick: () => handleNavigation(item.segment),
            }
          : item
      )}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout>
        <DashboardContainer>
          {/* Carte contenant les composants */}
          <StyledCard>
            <CardContent>
              {/* Composant actuel (Candidat, Session ou Home) */}
              <CurrentComponent />
            </CardContent>
          </StyledCard>
        </DashboardContainer>
      </DashboardLayout>
    </AppProvider>
  );
}

