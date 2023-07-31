const { assert, expect } = require("chai");
const { ethers, contract, artifacts } = require("hardhat");

const SimpleFunding = artifacts.require("SimpleFunding");
const BaseToken = artifacts.require("BaseToken");

contract("SimpleFunding Test", () => {
  beforeEach(async () => {
    const [owner, alice] = await ethers.getSigners();

    this.owner = owner;
    this.alice = alice;

    // SimpleFunding Contract
    this.SimpleFundingInstance = await SimpleFunding.new();

    const simpleFunding = await ethers.getContractFactory("SimpleFunding");
    this.SimpleFunding = await simpleFunding.deploy();
    await this.SimpleFunding.deployed();

    // Proxy Contract
    const proxy = await ethers.getContractFactory("SimpleFundingProxy");
    this.Proxy = await proxy.deploy();
    await this.Proxy.deployed();

    // BaseToken Contract
    this.BaseTokenInstance = await BaseToken.new();
    const baseToken = await ethers.getContractFactory("BaseToken");
    this.BaseToken = await baseToken.deploy();
    await this.BaseToken.deployed();

    // Set Implementation
    await this.Proxy.connect(this.owner).setImplementation(
      this.SimpleFunding.address
    );

    // Get Updated Proxy from SimpleFunding Contract
    this.updatedProxy = new ethers.Contract(
      this.Proxy.address,
      this.SimpleFundingInstance.abi,
      this.owner
    );
  });

  describe("Test SimpleFunding - Initialize", async () => {
    it("Check Proxy Address", async () => {
      assert.equal(
        await this.Proxy.getImplementation(),
        this.SimpleFunding.address
      );
    });
  });

  describe("Test SimpleFunding - ERC20 Token Transfer", async () => {
    beforeEach(async () => {
      // Transfer BaseToken to SimpleFunding Proxy Contract
      await this.BaseToken.connect(this.owner).transfer(
        this.Proxy.address,
        "10000000000000000000" // 10 BST
      );
    });

    it("Check Amount is Zero - Failed Case", async () => {
      // Try to transfer zero amount from SimpleFunding
      await expect(
        this.updatedProxy
          .connect(this.alice)
          .transferToken(this.BaseToken.address, this.alice.address, "0")
      ).to.be.revertedWith(
        "SimpleFunding: Transfer amount should be bigger than zero."
      );
    });

    it("Check Amount is Over - Failed Case", async () => {
      // Try to transfer over amount than SimpleFunding's
      await expect(
        this.updatedProxy
          .connect(this.alice)
          .transferToken(
            this.BaseToken.address,
            this.alice.address,
            "20000000000000000000"
          )
      ).to.be.revertedWith("SimpleFunding: Insuffcient ERC20 Transfer Amount");
    });

    it("Check Transfer - Successful Case", async () => {
      // Check Token Amount Before Transfer
      assert.equal(
        await this.BaseToken.balanceOf(this.updatedProxy.address),
        "10000000000000000000"
      );
      assert.equal(await this.BaseToken.balanceOf(this.alice.address), "0");

      // Transfer BaseToken From SimpleFunding To Alice
      await this.updatedProxy.transferToken(
        this.BaseToken.address,
        this.alice.address,
        "10000000000000000000"
      );

      // Check Token Amount After Transfer
      assert.equal(
        await this.BaseToken.balanceOf(this.updatedProxy.address),
        "0"
      );
      assert.equal(
        await this.BaseToken.balanceOf(this.alice.address),
        "10000000000000000000"
      );
    });
  });

  describe("Test SimpleFunding - ETH Transfer", async () => {
    it("Check Amount is Zero - Failed Case", async () => {
      // Try to transfer zero amount from SimpleFunding
      await expect(
        this.updatedProxy.connect(this.alice).transferEth(this.alice.address)
      ).to.be.revertedWith(
        "SimpleFunding: ETH amount should be bigger than zero."
      );
    });

    it("Check Transfer ETH - Successful Case", async () => {
      // Check ETH Balance of SimpleFunding Before Transfer
      assert.equal(
        await this.updatedProxy.provider.getBalance(this.updatedProxy.address),
        "0"
      );

      // Transfer ETH To SimpleFunding from Owner
      await this.owner.sendTransaction({
        to: this.updatedProxy.address,
        value: ethers.utils.parseEther("0.619"),
      });
      const sEthBalance = await this.updatedProxy.provider.getBalance(
        this.updatedProxy.address
      );
      // Check ETH Balance of SimpleFunding After Transfer
      assert.equal(ethers.utils.formatEther(sEthBalance), "0.619");

      // Transfer ETH From SimpleFunding to Alice
      await this.updatedProxy.transferEth(this.alice.address);

      // Check ETH Balance of SimpleFunding After Transfer
      assert.equal(
        await this.updatedProxy.provider.getBalance(this.updatedProxy.address),
        "0"
      );
      // Check ETH Balance of Alice After Transfer
      const aliceBalance = await this.alice.getBalance();
      // 10000.0(Original Hardhat Balance) + 0.619(Transfer From SimpleFunding)
      assert.equal(ethers.utils.formatEther(aliceBalance), "10000.619");
    });
  });
});
