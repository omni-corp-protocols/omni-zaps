import { ethers } from "hardhat";
import { expect } from "chai";
import { constants } from "ethers";

import { ZapFactory, Zap } from "../typechain";

describe("ZapFactory", () => {
  const AddressZero = constants.AddressZero;

  let admin, user1;
  let zapFactory: ZapFactory;

  before(async () => {
    [admin, user1] = await ethers.getSigners();
    admin; // lint ignore unused

    const ZapFactory = await ethers.getContractFactory("ZapFactory");
    zapFactory = await ZapFactory.deploy();
    await zapFactory.deployed();
  });

  it("Should have the base contract deployments", async () => {
    expect(zapFactory.address).to.exist;
  });

  it("Should create new Zap", async () => {
    expect(await zapFactory.zaps(user1.address)).to.equal(AddressZero);
    await expect(zapFactory.connect(user1).create()).to.emit(zapFactory, "NewZap");
    const zapAddress = await zapFactory.zaps(user1.address);
    expect(zapAddress).to.not.equal(AddressZero);
    const zap = (await ethers.getContractAt("Zap", zapAddress)) as Zap;
    expect(await zap.owner()).to.equal(user1.address);
  });

  it("Should not create new Zap for same user", async () => {
    expect(await zapFactory.zaps(user1.address)).to.not.equal(AddressZero);
    await expect(zapFactory.connect(user1).create()).to.be.revertedWith("ZapFactory: zap exists");
  });
});
