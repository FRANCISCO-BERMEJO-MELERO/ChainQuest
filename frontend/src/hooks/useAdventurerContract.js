import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import AdventureAbi from "../abis/AdventureNFT.json";

const CONTRACT_ADDRESS = "0xCB7f30717c23194f56Bd944D655A96d3B91a65cF";

export const useAdventurerContract = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contractRead, setContractRead] = useState(null);
  const [contractWrite, setContractWrite] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum === "undefined") {
        console.error("MetaMask no detectado");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const readContract = new Contract(CONTRACT_ADDRESS, AdventureAbi.abi, provider);
      const writeContract = new Contract(CONTRACT_ADDRESS, AdventureAbi.abi, signer);

      setProvider(provider);
      setSigner(signer);
      setContractRead(readContract);
      setContractWrite(writeContract);
    };

    init();
  }, []);

  return {
    provider,
    signer,
    contractRead,
    contractWrite,
  };
};
