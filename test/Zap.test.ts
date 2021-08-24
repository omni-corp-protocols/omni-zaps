import { ethers } from "hardhat";
import { expect } from "chai";
import { constants } from "ethers";

import { numToWei } from "../utils/ethUnitParser";
import { toBn } from "../utils/bn";
import { encodeParameters } from "../utils/ethUtils";

import { Zap, MockExternalContract } from "../typechain";

const getTotalValues = (valuesInEthArray: string[]): string => {
  const sum = valuesInEthArray.reduce((acc, currentValue) => toBn(acc).plus(toBn(currentValue)), toBn("0"));
  return numToWei(sum, 18);
};

describe("Zap", () => {
  const AddressZero = constants.AddressZero;

  let admin, user1, user2;
  let zap: Zap;
  let mExt: MockExternalContract;
  let mExt2: MockExternalContract;

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
      mExt2 = await MockExternalContract.deploy();
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

      const parsedValues = values.map(value => numToWei(value, 18));
      const callDatasEncoded = callDatas.map((e, i) => encodeParameters(signatures[i], e));
      await zap.connect(user1).execute(targets, parsedValues, signatures, callDatasEncoded, {
        value: getTotalValues(values),
      });
      expect(await mExt.num()).to.equal(callDatas[0][0]);
      expect(await mExt.value()).to.equal(numToWei(values[0], 18));
    });

    it("Should Zap multiple calls: Case 1", async () => {
      expect(await mExt.num()).to.equal(0);
      expect(await mExt.value()).to.equal(0);
      expect(await mExt2.str()).to.equal("");
      expect(await mExt2.addr()).to.equal(AddressZero);

      const targets = [mExt.address, mExt2.address];
      const values = ["0", "0"];
      const signatures = ["setNum(uint256)", "setStrAndAddr(string,address)"];
      const callDatas = [["10"], ["Test string", user1.address]];
      const callDatasEncoded = callDatas.map((e, i) => encodeParameters(signatures[i], e));
      await zap.connect(user1).execute(targets, values, signatures, callDatasEncoded);
      expect(await mExt.num()).to.equal(callDatas[0][0]);
      expect(await mExt2.str()).to.equal(callDatas[1][0]);
      expect(await mExt2.addr()).to.equal(callDatas[1][1]);
    });

    it("Should Zap multiple calls: Case 2", async () => {
      expect(await mExt.num()).to.equal(0);
      expect(await mExt.value()).to.equal(0);
      expect(await mExt2.value()).to.equal(0);
      expect(await mExt2.str()).to.equal("");
      expect(await mExt2.addr()).to.equal(AddressZero);

      const targets = [mExt.address, mExt2.address];
      const values = ["2", "3"];
      const signatures = ["setNumAndValue(uint256)", "setStrAddrAndValue(string,address)"];
      const callDatas = [["10"], ["Test string", user1.address]];

      const parsedValues = values.map(value => numToWei(value, 18));
      const callDatasEncoded = callDatas.map((e, i) => encodeParameters(signatures[i], e));
      await zap.connect(user1).execute(targets, parsedValues, signatures, callDatasEncoded, {
        value: getTotalValues(values),
      });

      expect(await mExt.num()).to.equal(callDatas[0][0]);
      expect(await mExt.value()).to.equal(numToWei(values[0], 18));

      expect(await mExt2.str()).to.equal(callDatas[1][0]);
      expect(await mExt2.addr()).to.equal(callDatas[1][1]);
      expect(await mExt2.value()).to.equal(numToWei(values[1], 18));
    });

    it("Should Zap multiple calls: Case 3", async () => {
      expect(await mExt.num()).to.equal(0);
      expect(await mExt.value()).to.equal(0);
      expect(await mExt2.value()).to.equal(0);
      expect(await mExt2.str()).to.equal("");
      expect(await mExt2.addr()).to.equal(AddressZero);

      const targets = [mExt.address, mExt2.address];
      const values = ["0", "5"];
      const signatures = ["setNum(uint256)", "setStrAddrAndValue(string,address)"];
      const callDatas = [["10"], ["Test string", user1.address]];

      const parsedValues = values.map(value => numToWei(value, 18));
      const callDatasEncoded = callDatas.map((e, i) => encodeParameters(signatures[i], e));
      await zap.connect(user1).execute(targets, parsedValues, signatures, callDatasEncoded, {
        value: getTotalValues(values),
      });

      expect(await mExt.num()).to.equal(callDatas[0][0]);
      expect(await mExt.value()).to.equal(numToWei(values[0], 18));

      expect(await mExt2.str()).to.equal(callDatas[1][0]);
      expect(await mExt2.addr()).to.equal(callDatas[1][1]);
      expect(await mExt2.value()).to.equal(numToWei(values[1], 18));
    });

    it("Should revert with reason when any of the given external call fails", async () => {
      const targets = [mExt.address, mExt2.address, mExt.address];
      const values = ["0", "5", "0"];
      const signatures = ["setNum(uint256)", "setStrAddrAndValue(string,address)", "revertWithReason(string)"];
      const callDatas = [["10"], ["Test string", user1.address], ["explicitly reverted"]];

      const parsedValues = values.map(value => numToWei(value, 18));
      const callDatasEncoded = callDatas.map((e, i) => encodeParameters(signatures[i], e));
      await expect(
        zap.connect(user1).execute(targets, parsedValues, signatures, callDatasEncoded, {
          value: getTotalValues(values),
        }),
      ).to.be.revertedWith(callDatas[2][0]);
    });

    it("Should revert without reason when any of the given external call fails", async () => {
      const targets = [mExt.address, mExt2.address, mExt.address];
      const values = ["0", "5", "0"];
      const signatures = ["setNum(uint256)", "setStrAddrAndValue(string,address)", "revertWithoutReason()"];
      const callDatas = [["10"], ["Test string", user1.address], []];

      const parsedValues = values.map(value => numToWei(value, 18));
      const callDatasEncoded = callDatas.map((e, i) => encodeParameters(signatures[i], e));
      await expect(
        zap.connect(user1).execute(targets, parsedValues, signatures, callDatasEncoded, {
          value: getTotalValues(values),
        }),
      ).to.be.revertedWith("Zap: call failed");
    });
  });
});
