import { ethers } from "hardhat";

export const encodeParameters = (fnABI: string, fnParams: string[]): string => {
  // eslint-disable-next-line
  const regex = /(\w+)\(([\w,\[\]]+)\)/;
  const res = regex.exec(fnABI);
  if (!res) {
    return "0x0";
  }
  const [_, __, fnInputs] = <[string, string, string]>(<unknown>res);
  return ethers.utils.defaultAbiCoder.encode(fnInputs.split(","), fnParams);
};
