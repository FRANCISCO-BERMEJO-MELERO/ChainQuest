const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();
const { getLevelFromXP } = require('./levels.js');

// === 1) Carga ABIs ANTES de usarlas
const { questManagerAbi, adventurerNFTAbi } = require('./abi');

// === 2) Interface y topic del evento (usa nombre y firma por seguridad)
const iface = new ethers.Interface(questManagerAbi);
const topicQuestCompleted = ethers.id("QuestCompleted(address,uint256,uint256,uint256)");


const app = express();
const port = 3000;
app.use(cors());

// === 3) Provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// === 4) Contratos
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

app.get('/metadata/:tokenId', async (req, res) => {
  const tokenId = req.params.tokenId;
  try {
    // Diagnóstico de red y direcciones
    const net = await provider.getNetwork();
    console.log('>> chainId:', net.chainId?.toString?.() ?? net.chainId);
    console.log('>> QM addr:', questManager.target);
    console.log('>> NFT addr:', adventurerNFT.target);
    console.log('>> tokenId:', tokenId);

    // ownerOf
    let owner;
    try {
      owner = await adventurerNFT.ownerOf(tokenId);
    } catch (err) {
      console.error('ownerOf error:', err?.message);
      return res.status(404).json({ error: `El token ${tokenId} no existe` });
    }
    console.log('>> ownerOf:', owner);

    // Filtro de logs: topic0 = QuestCompleted, topic1 = player indexado (owner)
    const logs = await provider.getLogs({
      address: questManager.target,
      fromBlock: 0,            // en local ok; en testnet luego lo optimizamos
      toBlock: 'latest',
      topics: [topicQuestCompleted, ethers.zeroPadValue(owner, 32)],
    });
    console.log('>> logs encontrados:', logs.length);

    // Parseo robusto + suma de XP (uint256 → BigInt)
    let xpTotal = 0n;
    for (const log of logs) {
      try {
        const parsed = iface.parseLog(log);
        // parsed.args: [player, questId, xpReward, timestamp]
        xpTotal += parsed.args.xpReward;
      } catch (e) {
        console.error('parseLog error:', e?.message);
      }
    }
    console.log('>> XP total (BigInt):', xpTotal.toString());

    const xpNum = Number(xpTotal); // para levels.js
    const { level, cid } = getLevelFromXP(xpNum);
    const imageUrl = `https://ipfs.io/ipfs/${cid}`;

    const metadata = {
      name: `Aventurero #${tokenId}`,
      description: 'Tu personaje NFT de ChainQuest',
      image: imageUrl,
      attributes: [
        { trait_type: 'Nivel', value: level },
        { trait_type: 'XP', value: xpNum },
        { trait_type: 'Clase', value: 'No asignada' },
      ],
    };

    res.setHeader('Content-Type', 'application/json');
    return res.json(metadata);
  } catch (err) {
    console.error('[/metadata] ERROR:', err?.stack || err?.message || err);
    return res.status(500).json({ error: 'Error al generar metadata' });
  }
});

app.listen(port, () => {
  console.log(`🧙 API escuchando en http://localhost:${port}`);
});
