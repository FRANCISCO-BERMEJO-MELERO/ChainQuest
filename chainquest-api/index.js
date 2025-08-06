const express = require('express');
const cors = require('cors'); // ✅ AÑADIDO
const { ethers } = require('ethers');
require('dotenv').config();
const { getLevelFromXP } = require('./levels.js');


const app = express();
const port = 3000;

// ✅ HABILITA CORS PARA TODAS LAS RUTAS Y ORÍGENES
app.use(cors());

// Configurar provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const { questManagerAbi, adventurerNFTAbi } = require('./abi');

const adventurerNFT = new ethers.Contract(
  process.env.ADVENTURER_NFT_ADDRESS,
  adventurerNFTAbi,
  provider
);

const questManager = new ethers.Contract(
  process.env.QUEST_MANAGER_ADDRESS,
  questManagerAbi,
  provider
);



// Aquí cargarás el ABI y contratos luego
// const questManager = new ethers.Contract(...)
// const adventurerNFT = new ethers.Contract(...)

app.get('/metadata/:tokenId', async (req, res) => {
  const tokenId = req.params.tokenId;

  try {
    let owner;
    try {
      owner = await adventurerNFT.ownerOf(tokenId);
    } catch (err) {
      return res.status(404).json({ error: `El token ${tokenId} no existe` });
    }


    const logs = await provider.getLogs({
      address: questManager.target,
      fromBlock: 0,
      toBlock: "latest",
      topics: [
        ethers.id("QuestCompleted(address,uint256,uint256,uint256)"),
        ethers.zeroPadValue(owner, 32)
      ]
    });

    const xpTotal = logs.reduce((acc, log) => {
    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
      ["address", "uint256", "uint256", "uint256"],
      log.data
    );
    return acc + decoded[2]; // xpReward
    }, 0);

    // Lógica de niveles simple
    const calculateLevel = (xp) => {
      if (xp >= 300) return 3;
      if (xp >= 100) return 2;
      return 1;
    };

    const { level, cid } = getLevelFromXP(xpTotal);
    const imageUrl = `https://ipfs.io/ipfs/${cid}`;


    const metadata = {
      name: `Aventurero #${tokenId}`,
      description: "Tu personaje NFT de ChainQuest",
      image: imageUrl,
      attributes: [
        { trait_type: "Nivel", value: level },
        { trait_type: "XP", value: xpTotal },
        { trait_type: "Clase", value: "No asignada" }
      ]
    };

    res.json(metadata);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar metadata" });
  }
});

app.listen(port, () => {
  console.log(`🧙 API escuchando en http://localhost:${port}`);
});


