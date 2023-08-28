import { useEffect, useState } from "react";

import {
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
  BaseAdapterSettings,
  WALLET_ADAPTERS,
} from "@web3auth/base";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";

import { useMounted } from "../hooks/use-mounted";
import { useWallets } from "../hooks/use-wallets";

import RPC from "../auth/ethersRPC";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "";

const web3authConfig = {
  clientId,
  sessionTime: 3600,
  web3AuthNetwork: "cyan",
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x1",
    rpcTarget: "https://rpc.ankr.com/eth",
    displayName: "Ethereum Mainnet",
    blockExplorer: "https://goerli.etherscan.io",
    ticker: "ETH",
    tickerName: "Ethereum",
  },
} satisfies BaseAdapterSettings;

function App() {
  const mounted = useMounted();
  const { hasPhantom, hasMetamask } = useWallets();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null,
  );
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const web3authInstance = new Web3AuthNoModal(web3authConfig);

        const metamaskAdapter = new MetamaskAdapter(web3authConfig);
        web3authInstance.configureAdapter(metamaskAdapter);

        setWeb3auth(web3authInstance);
        await web3authInstance.init();
        setProvider(web3authInstance.provider);

        if (web3authInstance.connectedAdapterName) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (mounted) {
      init();
    }
  }, [mounted]);

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>code");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        loginProvider: "google",
      },
    );
    setProvider(web3authProvider);
    setLoggedIn(true);
  };

  const loginWithPhantom = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.METAMASK);
    setProvider(web3authProvider);
    setLoggedIn(true);
  };

  const loginWithMetamask = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.METAMASK);
    setProvider(web3authProvider);
    setLoggedIn(true);
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
  };

  const getChainId = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    uiConsole(chainId);
  };

  const addChain = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const newChain = {
      chainId: "0x5",
      displayName: "Goerli",
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      tickerName: "Goerli",
      ticker: "ETH",
      decimals: 18,
      rpcTarget: "https://rpc.ankr.com/eth_goerli",
      blockExplorer: "https://goerli.etherscan.io",
    };
    await web3auth?.addChain(newChain);
    uiConsole("New Chain Added");
  };

  const switchChain = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    await web3auth?.switchChain({ chainId: "0x5" });
    uiConsole("Chain Switched");
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();
    uiConsole(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    uiConsole(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    uiConsole(privateKey);
  };

  return (
    <div className="container px-4 py-8 mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-center sm:text-4xl text-slate-900">
        Web3Auth + Ethereum
      </h1>

      <div className="">
        {loggedIn ? (
          <div className="grid grid-cols-6 gap-4">
            <button
              onClick={getUserInfo}
              className="rounded-lg border border-sky-500 py-3 px-6 text-sm text-sky-500 transition-all hover:opacity-75 focus:ring focus:ring-sky-200 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Get User Info
            </button>
            <button
              onClick={authenticateUser}
              className="rounded-lg border border-sky-500 py-3 px-6 text-sm text-sky-500 transition-all hover:opacity-75 focus:ring focus:ring-sky-200 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Get ID Token
            </button>
            <button
              onClick={getChainId}
              className="rounded-lg border border-sky-500 py-3 px-6 text-sm text-sky-500 transition-all hover:opacity-75 focus:ring focus:ring-sky-200 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Get Chain ID
            </button>
            <button
              onClick={addChain}
              className="rounded-lg border border-sky-500 py-3 px-6 text-sm text-sky-500 transition-all hover:opacity-75 focus:ring focus:ring-sky-200 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Add Chain
            </button>
            <button
              onClick={switchChain}
              className="rounded-lg border border-sky-500 py-3 px-6 text-sm text-sky-500 transition-all hover:opacity-75 focus:ring focus:ring-sky-200 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Switch Chain
            </button>
            <button
              onClick={getAccounts}
              className="rounded-lg border border-sky-500 py-3 px-6 text-sm text-sky-500 transition-all hover:opacity-75 focus:ring focus:ring-sky-200 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Get Accounts
            </button>
            <button
              onClick={getBalance}
              className="rounded-lg border border-sky-500 py-3 px-6 text-sm text-sky-500 transition-all hover:opacity-75 focus:ring focus:ring-sky-200 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Get Balance
            </button>
            <button
              onClick={signMessage}
              className="rounded-lg border border-sky-500 py-3 px-6 text-sm text-sky-500 transition-all hover:opacity-75 focus:ring focus:ring-sky-200 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Sign Message
            </button>
            <button
              onClick={sendTransaction}
              className="rounded-lg border border-sky-500 py-3 px-6 text-sm text-sky-500 transition-all hover:opacity-75 focus:ring focus:ring-sky-200 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Send Transaction
            </button>
            <button
              onClick={getPrivateKey}
              className="rounded-lg border border-sky-500 py-3 px-6 text-sm text-sky-500 transition-all hover:opacity-75 focus:ring focus:ring-sky-200 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Get Private Key
            </button>
            <button
              onClick={logout}
              className="rounded-lg border border-sky-500 py-3 px-6 text-sm text-sky-500 transition-all hover:opacity-75 focus:ring focus:ring-sky-200 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Log Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col max-w-sm gap-4 mx-auto">
            <button
              onClick={login}
              className="rounded-lg bg-sky-500 py-3 px-6 text-sm text-white shadow-md shadow-sky-500/20 transition-all hover:shadow-lg hover:shadow-sky-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Login
            </button>
            <button
              onClick={loginWithPhantom}
              disabled={isLoading || !hasPhantom}
              className="rounded-lg bg-sky-500 py-3 px-6 text-sm text-white shadow-md shadow-sky-500/20 transition-all hover:shadow-lg hover:shadow-sky-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Login with Phantom
            </button>
            <button
              onClick={loginWithMetamask}
              disabled={isLoading || !hasMetamask}
              className="rounded-lg bg-sky-500 py-3 px-6 text-sm text-white shadow-md shadow-sky-500/20 transition-all hover:shadow-lg hover:shadow-sky-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Login with Metamask
            </button>
          </div>
        )}
      </div>

      <pre id="console">
        <code></code>
      </pre>
    </div>
  );
}

export default App;
