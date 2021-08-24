import { ethers } from "hardhat";
import { expect } from "chai";

import { numToWei } from "../utils/ethUnitParser";
import { toBn } from "../utils/bn";
import { encodeParameters } from "../utils/ethUtils";

import { Zap, MockExternalContract } from "../typechain";

const getTotalValues = (valuesInEthArray: string[]): string => {
  const sum = valuesInEthArray.reduce((acc, currentValue) => toBn(acc).plus(toBn(currentValue)), toBn("0"));
  return numToWei(sum, 18);
};

describe("Zap", () => {
  let admin, user1, user2;
  let zap: Zap;
  let mExt: MockExternalContract;

  before(async () => {
    [admin, user1, user2] = await ethers.getSigners();
    admin; // lint ignore unused

    const Zap = await ethers.getContractFactory("Zap");
    zap = await Zap.connect(user1).deploy(user1.address);
    await zap.deployed();
  });

  it("Should have the base contract deployments", async () => {
    expect(zap.address).to.exist;
    expect(await zap.owner()).to.equal(user1.address);
  });

  describe("Zap External Calls", () => {
    beforeEach(async () => {
      const MockExternalContract = await ethers.getContractFactory("MockExternalContract");
      mExt = await MockExternalContract.deploy();
      await mExt.deployed();
    });

    it("Should not allow execution if caller is not owner", async () => {
      const targets = [mExt.address];
      const values = ["0"];
      const signatures = ["setNum(uint256)"];
      const callDatas = [["10"]];
      const callDatasEncoded = callDatas.map((e, i) => encodeParameters(signatures[i], e));
      await expect(zap.connect(user2).execute(targets, values, signatures, callDatasEncoded)).to.be.revertedWith(
        "Zap: caller is not the owner",
      );
    });

    it("Should Zap single call without msg.value", async () => {
      expect(await mExt.num()).to.equal(0);
      expect(await mExt.value()).to.equal(0);
      const targets = [mExt.address];
      const values = ["0"];
      const signatures = ["setNum(uint256)"];
      const callDatas = [["10"]];
      const callDatasEncoded = callDatas.map((e, i) => encodeParameters(signatures[i], e));
      await zap.connect(user1).execute(targets, values, signatures, callDatasEncoded);
      expect(await mExt.num()).to.equal(callDatas[0][0]);
    });

    it("Should Zap single call with msg.value", async () => {
      expect(await mExt.num()).to.equal(0);
      expect(await mExt.value()).to.equal(0);
      const targets = [mExt.address];
      const values = ["5"];
      const signatures = ["setNumAndValue(uint256)"];
      const callDatas = [["10"]];
      const callDatasEncoded = callDatas.map((e, i) => encodeParameters(signatures[i], e));
      await zap.connect(user1).execute(targets, values, signatures, callDatasEncoded, {
        value: getTotalValues(values),
      });
      expect(await mExt.num()).to.equal(callDatas[0][0]);
    });
  });
});
