// src/hooks/useRegistryWriteContract.js
import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import AdventureAbi from "../abis/AdventureNFT.json";

const CONTRACT_ADDRESS = "0xf58AB87bB084646f038B3a6BB40BfE98B16d5b48";

export const useRegistryWriteContract = () => {
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum === "undefined") {
        console.error("MetaMask no detectado");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, AdventureAbi.abi, signer);

      setSigner(signer);
      setContract(contract);
    };

    init();
  }, []);

  return { contract, signer };
};
