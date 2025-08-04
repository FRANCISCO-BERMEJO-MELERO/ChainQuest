import { useEffect } from "react";
import { useChainId, useSwitchChain } from "wagmi";
import { mainChain } from "./wagmi";

const DESIRED_CHAIN_ID = mainChain.id;

export function NetworkGuard() {
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (currentChainId !== DESIRED_CHAIN_ID && switchChain) {
      switchChain({ chainId: DESIRED_CHAIN_ID });
    }
  }, [currentChainId, switchChain]);

  return null;
}
