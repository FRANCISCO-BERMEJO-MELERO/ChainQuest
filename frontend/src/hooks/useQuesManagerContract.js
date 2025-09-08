import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import AdventureAbi from "../abis/QuestManager.json";

const CONTRACT_ADDRESS = "0xfb84030Ab3bd035aE02a33271107d7f3fe31Ef21";

export const useQuesManagerContract = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contractReadQ, setContractRead] = useState(null);
  const [contractWriteQ, setContractWrite] = useState(null);

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
    contractReadQ,
    contractWriteQ,
  };
};
