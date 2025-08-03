const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const port = 3000;

// Configurar provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Aquí cargarás el ABI y contratos luego
// const questManager = new ethers.Contract(...)
// const adventurerNFT = new ethers.Contract(...)

app.get('/metadata/:tokenId', async (req, res) => {
  const tokenId = req.params.tokenId;

  // 1. Obtener address del jugador (usando playerToTokenId inverso o directamente)
  // 2. Leer eventos MissionCompleted del jugador
  // 3. Calcular XP y nivel
  // 4. Armar JSON dinámico

  const metadata = {
    name: `Aventurero #${tokenId}`,
    description: "Tu personaje NFT de ChainQuest",
    image: "https://ipfs.io/ipfs/QmdjTD8Nt1qe1nLBdMsgsE64d8N4reL73ozeh1Dj6xG5pN",
    attributes: [
      { trait_type: "Nivel", value: 1 },
      { trait_type: "XP", value: 0 },
      { trait_type: "Clase", value: "No asignada" }
    ]
  };

  res.json(metadata);
});

app.listen(port, () => {
  console.log(`🧙 API escuchando en http://localhost:${port}`);
});
