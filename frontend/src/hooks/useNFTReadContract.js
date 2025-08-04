// src/hooks/useRegistryReadContract.ts
import { Contract, JsonRpcProvider } from "ethers";
import AdventureAbi from "../abis/AdventureNFT.json";

const CONTRACT_ADDRESS = "0xf58AB87bB084646f038B3a6BB40BfE98B16d5b48";

export const useNFTReadContract = () => {
    const provider = new JsonRpcProvider("http://127.0.0.1:7545");

    const contract = new Contract(CONTRACT_ADDRESS, AdventureAbi.abi, provider);

    return contract;
};
