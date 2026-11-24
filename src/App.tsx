import { Header } from './components/Header';
import { StoreProvider, useRoute } from './store';
import { ProjectPage } from './pages/ProjectPage';
import { BuildingPage } from './pages/BuildingPage';
import { UnitPage } from './pages/UnitPage';
import { ComparePage } from './pages/ComparePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { InterestPage } from './pages/InterestPage';
import { PreQualPage } from './pages/PreQualPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ReceiptPage } from './pages/ReceiptPage';
import { MinBoligPage } from './pages/MinBoligPage';

function Router() {
  const { page, param } = useRoute();
  switch (page) {
    case 'bygg': return <BuildingPage />;
    case 'leilighet': return <UnitPage id={param ?? ''} key={param} />;
    case 'sammenlign': return <ComparePage />;
    case 'favoritter': return <FavoritesPage />;
    case 'interesse': return <InterestPage ids={decodeURIComponent(param ?? '')} />;
    case 'forhandsgodkjenning': return <PreQualPage />;
    case 'kjop': return <CheckoutPage id={param ?? ''} key={param} />;
    case 'kvittering': return <ReceiptPage />;
    case 'min-bolig': return <MinBoligPage />;
    default: return <ProjectPage />;
  }
}

export default function App() {
  return (
    <StoreProvider>
      <Header />
      <main><Router /></main>
      <footer className="footer">Prototype laget i designsprinten · Fiktive data · Ingen betaling, kredittsjekk eller opplasting skjer</footer>
    </StoreProvider>
  );
}
