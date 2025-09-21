import { CardNFT } from './components/CardNFT';
import Header from './components/Header';
import QuestList from "./components/QuestList";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 bg-no-repeat  " style={{ backgroundImage: 'url("/ChatGPT Image 26 ago 2025, 17_33_38.png")' }}>
          <Header />
      {/* padding-right para no quedar bajo el panel fijo (opcional) */}
      <div className="flex  " > 
        <CardNFT />
      </div>

      {/* Panel fijo arriba-derecha */}
      <QuestList />
    </div>
  );
}

export default App;
