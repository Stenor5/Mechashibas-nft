import { useEthers, shortenAddress, Mainnet, Ropsten } from "@usedapp/core";
import { toast } from "react-toastify";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import "react-toastify/dist/ReactToastify.css";
import "./Header.scss";

const Header = () => {
  const { account, activate, chainId, deactivate } = useEthers();

  const handleConnect = async () => {
    const providerOptions = {
      injected: {
        display: {
          name: "Metamask",
          description: "Connect with the provider in your Browser",
        },
        package: null,
      },
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID,
        },
      },
    };

    if (!account) {
      const web3Modal = new Web3Modal({
        providerOptions,
      });
      const provider = await web3Modal.connect();
      await activate(provider);
    }
  };
  return (
    <header className="flex w-full justify-end py-3 pr-5">
      {!account ? (
        <button className="btn btn-primary" onClick={handleConnect}>
          Connect
        </button>
      ) : (
        <button className="btn btn-primary" onClick={() => deactivate()}>
          {shortenAddress(account)}
        </button>
      )}
    </header>
  );
};

export default Header;
