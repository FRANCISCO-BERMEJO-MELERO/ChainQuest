// src/components/CardNFT.jsx
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useAdventurerContract } from '../hooks/contracts/useAdventurerContract'
import XPProgressBar from "./XpBar"

export const CardNFT = () => {
  const { address, isConnected } = useAccount();
  const { contractRead } = useAdventurerContract();
  const [level, setlevel] = useState();

  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [xp, setxp] = useState();


  const CaculateXp = (attrs) => {
    const xpAttr = attrs.find(a => a.trait_type === "XP");
    return xpAttr.value 
  }

  useEffect(() => {
    const loadNFT = async () => {
      if (!address || !contractRead ) return;

      try {
        const tokenId = await contractRead.playerToTokenId(address);
        if (tokenId == 0) {
          setError("No tienes un NFT aún.");
          setLoading(false);
          return;
        }

        const tokenURI = await contractRead.tokenURI(tokenId);
        const response = await fetch(tokenURI);
        const data = await response.json();
        const attr = data.attributes || [];
        setxp(CaculateXp(attr))
        const levelAttr = attr.find(a => a.trait_type === "Nivel");
        setlevel(levelAttr.value);
        setMetadata(data);
      } catch (err) {
        console.error("Error al cargar el NFT:", err);
        setError("No se pudo obtener el NFT.");
      } finally {
        setLoading(false);
      }
    };

    loadNFT();
  }, [address, contractRead, xp]);

  if (loading) return <div className="p-4"></div>;
  if (error) return <div className="p-4 text-red-600">⚠️ {error}</div>;
  if (!metadata) return null;

  

  return (
   <>
  {isConnected && (
    <div className="mx-auto">
      <div
        className="max-w-sm rounded-2xl overflow-hidden shadow-xl p-4 mx-auto my-20 border-2"
        style={{
          background:
            'radial-gradient(120% 140% at 50% 0%, #fff6d7 0%, #efe3c4 35%, #e6d7b1 100%)',
          borderColor: '#d6c497',
          boxShadow:
            '0 8px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.5)',
        }}
      >
        <img
          className="w-full rounded-xl border border-[#d6c497]/70 shadow-md"
          src={metadata.image}
          alt={metadata.name}
        />
        <div className="py-4 text-center">
          <h2 className="text-2xl font-extrabold text-[#3b2a1a] drop-shadow-sm mb-1">
            {metadata.name}
          </h2>
          <p className="text-[#5a4633] text-sm italic">{metadata.description}</p>
        </div>
      </div>
      <XPProgressBar totalXP={xp} level={level} />
    </div>
  )}
</>

  );
};
