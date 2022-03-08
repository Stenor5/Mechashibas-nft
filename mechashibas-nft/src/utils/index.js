import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletLink from 'walletlink';
import Authereum from 'authereum';

let web3Modal;
let provider;
let selectedAccount;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: process.env.REACT_APP_INFURA_ID,
      qrcodeModalOptions: {
        mobileLinks: [
          'rainbow',
          'metamask',
          'argent',
          'trust',
          'imtoken',
          'pillar',
        ],
      },
    },
  },
  walletlink: {
    package: WalletLink, // Required
    options: {
      appName: 'Dysto Apez',
      infuraId: process.env.REACT_APP_INFURA_ID,
      rpc: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`, // Optional if `infuraId` is provided; otherwise it's required
      chainId: 1, // Optional. It defaults to 1 if not provided
      appLogoUrl: null, // Optional. Application logo image URL. favicon is used if unspecified
      darkMode: false, // Optional. Use dark theme, defaults to false
    },
  },
  authereum: {
    package: Authereum, // required
  },
};

web3Modal = new Web3Modal({
  network: 'mainnet', // optional
  cacheProvider: true, // optional
  providerOptions, // required
  theme: 'dark',
});

export const disconnectWallet = async () => {
  try {
    return await web3Modal.clearCachedProvider();
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const showWeb3WalletModal = async () => {
  try {
    provider = await web3Modal.connect();
  } catch (e) {
    console.log('Could not get a wallet connection', e);
    return;
  }

  return provider;
};

export const getCurrentWalletAddress = async () => {
  try {
    if (web3Modal.cachedProvider) {
      provider = await web3Modal.connect();
    } else {
      return null;
    }
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    if (accounts && accounts.length > 0) {
      selectedAccount = accounts[0];
      return selectedAccount;
    } else {
      return null;
    }
  } catch (e) {
    console.error('Could not getCurrentWalletAddress', e);
    return null;
  }
};

export const getCurrentNetworkId = async () => {
  try {
    if (web3Modal.cachedProvider) {
      provider = await web3Modal.connect();
    } else {
      return null;
    }
    const web3 = new Web3(provider);
    return await web3.eth.net.getId();
  } catch (e) {
    console.error('Could not getCurrentNetworkId', e);
    return null;
  }
};
