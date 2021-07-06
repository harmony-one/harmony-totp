
const config = require("../../webclient/src/config");
const SmartVault = require("../../lib/smartvault_lib");
const HarmonyClient = require("../../lib/harmony_client");
var assert = require('assert');
const Web3 = require("web3");
const sleep = (sec) => new Promise(resolve => setTimeout(resolve, 1000 * sec))
const wallet = require("../../lib/wallet");

describe("SmartVault test", () => {
    // ganache private key
    process.env.PRIVATE_KEY = "0xe3824b99299f15cee4f54c4fe35ccf7ebfb094d885ea334c1e06636b1ff87af3";
    process.env.EA_PORT = 8989;
    const relayer = require("../../relayer/index");
    relayer.server();

    const provider = new Web3.providers.HttpProvider(config.CONFIG["development"].RPC_URL);
    const web3 = new Web3(provider);

    it("Test serialization", async () => {
      const blockNumber = await web3.eth.getBlockNumber();
      var client = new SmartVault(config.CONFIG["development"]);
      var name = "testsupercrazylong" + blockNumber + ".crazy.one";
      var data = await client.create(name);
      client.generateHashes(4);
      var filename = client.saveWalletLocal();
      
      var client = new SmartVault(config.CONFIG["development"]);
      client.loadFromLocal(filename);
      console.log(client.walletData);

      console.log(client.listWallets())
    })

    it("Recover wallet", async () => {
       var secret = "JBSWY3DPEHPK3PXP";
       var tokens = [];
       for(var i=0; i<5; i++) {
         tokens.push(wallet.getTOTP(secret, i+5));
       }

       var client = new SmartVault(config.CONFIG["development"]);
       await client.recoverWallet("testsupercrazylong825.crazy.one", tokens, status=>{
         console.log("STATUS:", status);
       });

    })

    it("creates an account", async () => {
        var client = new SmartVault(config.CONFIG["development"]);
        var data = await client.create("hashmesan001.crazy.one");
        //assert.strictEqual(data, null);
        const blockNumber = await web3.eth.getBlockNumber();

        var name = "testsupercrazylong" + blockNumber + ".crazy.one";
        console.log("Checking name=", name);

        data = await client.create(name);
        assert.strictEqual(data != null, true);

        // not working async :(
        //assert.throws(async ()=>await client.submitWallet(),/Must generate leaves first.*/)

        // var generateHash = () => new Promise((resolve, reject) => {
        //     client.generateHashes(4, (p)=>{
        //         console.log("progress=", p);
        //     });

        //     resolve();
        // })
        // await generateHash();

        console.log(client.getDepositInfo());

        var deposits = await client.getDeposits();
        console.log("Balance=", deposits);

        var accounts = await web3.eth.getAccounts();

        var res = await web3.eth.sendTransaction({
            from: accounts[0],
            to: client.getWalletData().walletAddress,
            value: Web3.utils.toWei("2.0")
          });
        
        console.log("sent 2.0 to", client.getWalletData().walletAddress);
        assert.strictEqual(res.status, true);

        deposits = await client.getDeposits();
        console.log("Balance=", deposits);    
        assert.strictEqual(web3.utils.toWei("2.0"), deposits);
        

        await client.submitWallet(null, status=>{
            console.log("STATUS: ", status)
        });
        assert.strictEqual(client.getWalletData().root_arr.length, 5);

        deposits = await client.getDeposits();
        console.log("Balance=", deposits);    
        assert.strictEqual("998769999999864291", deposits);
        
        client.saveWalletLocal();

        return true;
    });

});