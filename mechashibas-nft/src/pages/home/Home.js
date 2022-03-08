import { useState, useEffect, useReducer } from "react";
import { Rinkeby, useEthers, useBlockMeta } from "@usedapp/core";
import { isMobile } from "react-device-detect";
import { toast } from "react-toastify";
import { utils } from "ethers";
import AppLayout from "../AppLayout";
import { ReactComponent as MinusIcon } from "../../assets/icons/icon-minus.svg";
import { ReactComponent as PlusIcon } from "../../assets/icons/icon-plus.svg";

import {
  useTotalSupply,
  useCost,
  useMaxMintAmount,
  usePublicSalePaused,
  useWhitelistSalePaused,
  useMint,
  useWhitelistMint,
} from "../../hooks";
import { getSignature } from "../../services";

import "./Home.scss";

// let provider = ethers.providers.getDefaultProvider("rinkeby");

// let contract = new ethers.Contract(
//   MechaShibasContractAddress,
//   MechaShibasContractABI,
//   provider
// );

const initialState = { numberOfToken: 1 };
let maxVal = 0;
let tokenPrice = 0.0;
let isPresale = false;

const reducer = (state, action) => {
  switch (action) {
    case "plus":
      if (state.numberOfToken < maxVal)
        return { numberOfToken: state.numberOfToken + 1 };
      return { numberOfToken: state.numberOfToken };
    case "minus":
      if (state.numberOfToken > 1)
        return { numberOfToken: state.numberOfToken - 1 };
      return { numberOfToken: state.numberOfToken };
    case "max":
      return { numberOfToken: 5 };
    default:
      throw new Error("There is an error");
  }
};

const Home = () => {
  const { account, activateBrowserWallet, deactivate } = useEthers();

  const [isMainnet, setMainnet] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);

  const { state: mintState, send: mint, events: publicMintEvents } = useMint();
  const {
    state: whitelistMintState,
    send: whitelistMint,
    events: whitelistMintEvents,
  } = useWhitelistMint();

  window?.ethereum?.on("chainChanged", () => {
    window.location.reload();
  });

  maxVal = useMaxMintAmount();
  tokenPrice = maxVal == 3 ? 0.04 : 0.06;
  isPresale = maxVal == 3 ? true : false;

  useEffect(() => {
    if (isMobile) {
      toast.info("Mobile mint comming soon");
    }
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const networkId = parseInt(window?.ethereum?.chainId, 16) || 0;
    if (networkId === Rinkeby.chainId) {
      setMainnet(true);
    } else {
      setMainnet(false);
      toast.error("Please make sure you are on the Rinkeby network");
    }
  }, []);
  useEffect(() => {
    mintState.status === "Exception" && toast.error(mintState.errorMessage);
    mintState.status === "Success" && toast.info("Mint Success");
  }, [mintState]);

  useEffect(() => {
    whitelistMintState.status === "Exception" &&
      toast.error(whitelistMintState.errorMessage);
    whitelistMintState.status === "Success" &&
      toast.info("Whitelist Mint Success");
  }, [whitelistMintState]);

  const handleMint = async () => {
    if (isMobile) return;

    if (!account || !isMainnet) {
      toast.error("Wrong selected network");
      return;
    }

    const ethPrice = state.numberOfToken * tokenPrice;

    if (!isPresale) {
      mint(state.numberOfToken, {
        value: utils.parseEther(ethPrice.toString()),
      });
    } else {
      try {
        const response = await getSignature(account);

        if (response.verified) {
          whitelistMint(state.numberOfToken, response.proof, {
            value: utils.parseEther(ethPrice.toString()),
          });
        } else {
          toast.error("Not Whitelist Address");
        }
      } catch (e) {
        toast.error(e);
      }
    }
  };

  return (
    <AppLayout>
      <main className="flex justify-center items-center">
        <div className="nft-panel">
          <div className="nft-counter">
            <MinusIcon onClick={(e) => dispatch("minus")} />
            <div className="amount">{state.numberOfToken}</div>
            <PlusIcon onClick={(e) => dispatch("plus")} />
            {/* <button className="max-btn" onClick={() => dispatch("max")}>
              Get max
            </button> */}
          </div>
          <button className="btn btn-primary" onClick={(e) => handleMint()}>
            MINT
          </button>
        </div>
      </main>
    </AppLayout>
  );
};

export default Home;
