// src/components/CardNFT.jsx
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useAdventurerContract } from '../hooks/contracts/useAdventurerContract'
import XPProgressBar from "./XpBar"

export const CardNFT = () => {
  const { address, isConnected } = useAccount();
  const { contractRead } = useAdventurerContract();

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
        const atr = data.attributes || [];
        setxp(CaculateXp(atr))

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
          <div className="max-w-sm rounded-2xl overflow-hidden shadow-lg p-4 bg-white border mx-auto my-20">
            <img
              className="w-full rounded-xl"
              src={metadata.image}
              alt={metadata.name}
            />
            <div className="py-4">
              <h2 className="text-xl text-gray-950 font-bold mb-2">{metadata.name}</h2>
              <p className="text-gray-700 text-sm">{metadata.description}</p>
            </div>
          </div>
          <XPProgressBar totalXP={xp} />
        </div>
      )}
    </>
  );
};
