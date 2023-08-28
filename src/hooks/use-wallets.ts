import { useEffect, useState } from 'react';

export const useWallets = () => {
  const [hasPhantom, setHasPhantom] = useState<boolean>(false);
  const [hasMetamask, setHasMetamask] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setHasPhantom((window as any).phantom);
    setHasMetamask((window as any).ethereum);
  }, []);

  return {
    hasPhantom,
    hasMetamask,
  };
};
