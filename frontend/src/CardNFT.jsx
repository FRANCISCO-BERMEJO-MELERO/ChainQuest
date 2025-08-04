// src/components/CardNFT.jsx
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useNFTReadContract } from "./hooks/useNFTReadContract";

export const CardNFT = () => {
  const { address } = useAccount();
  const contract = useNFTReadContract();

  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNFT = async () => {
      if (!address) return;

      try {
        const tokenId = await contract.playerToTokenId(address);
        if (tokenId == 0) {
          setError("No tienes un NFT aún.");
          setLoading(false);
          return;
        }

        const tokenURI = await contract.tokenURI(tokenId);
        const response = await fetch(tokenURI);
        const data = await response.json();

        setMetadata(data);
      } catch (err) {
        console.error("Error al cargar el NFT:", err);
        setError("No se pudo obtener el NFT.");
      } finally {
        setLoading(false);
      }
    };

    loadNFT();
  }, [address, contract]);

  if (loading) return <div className="p-4">🔄 Cargando tu NFT...</div>;
  if (error) return <div className="p-4 text-red-600">⚠️ {error}</div>;
  if (!metadata) return null;

  return (
    <div className="max-w-sm rounded-2xl overflow-hidden shadow-lg p-4 bg-white border">
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
  );
};
