import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { useContractCall, useContractFunction } from "@usedapp/core";
import MechaShibasContractABI from "../abi/MechaShibasContractABI.json";
import { MechaShibasContractAddress } from "../contracts";

const MechaShibasContractInterface = new ethers.utils.Interface(
  MechaShibasContractABI
);
const MechaShibasContract = new Contract(
  MechaShibasContractAddress,
  MechaShibasContractInterface
);

export const useTotalSupply = () => {
  console.log(MechaShibasContractInterface);
  const [totalSupply] =
    useContractCall({
      abi: MechaShibasContractInterface,
      address: MechaShibasContractAddress,
      method: "totalSupply",
      args: [],
    }) ?? [];
  return totalSupply;
};

export const useMaxMintAmount = () => {
  const [maxMintAmount] =
    useContractCall({
      abi: MechaShibasContractInterface,
      address: MechaShibasContractAddress,
      method: "maxMintAmount",
      args: [],
    }) ?? [];

  return maxMintAmount;
};

export const useMint = () => {
  const { state, send, event } = useContractFunction(
    MechaShibasContract,
    "mint",
    {}
  );
  return { state, send, event };
};

export const useWhitelistMint = () => {
  const { state, send, events } = useContractFunction(
    MechaShibasContract,
    "whitelistMint",
    {}
  );

  return { state, send, events };
};
