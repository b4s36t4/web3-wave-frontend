import * as React from "react";
import { ethers } from "ethers";
import "./App.css";
import abiFile from "./contents/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [allWaves, setAllWaves] = React.useState([]);

  const [blocked, setBlocked] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const contractAddress = "0x9FED6764796cea4C2041BAE8F02cFd7c4B13c6fB";
  React.useEffect(() => {
    console.log(process.env);
    const checkWalletConnected = async () => {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("No ethereum found now ");
        return;
      } else {
        console.log("Have ethereum in the browser ;)");
      }
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Got an account from wallet", account);
        setCurrentAccount(account);
      } else {
        console.log("No account got from meta mask or unauthorised");
      }
    };
    checkWalletConnected();
    getAllWaves();
  }, []);

  const getAllWaves = async () => {
    try {
      if (window && window?.ethereum) {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waveContract = new ethers.Contract(
          contractAddress,
          abiFile.abi,
          signer
        );

        const isBlocked = await waveContract.check_blocked();

        setBlocked(isBlocked);

        const waves = await waveContract.getAllWaves();

        const cleanedWaves = waves.map((wave, index) => {
          return {
            address: wave.waveFrom,
            timestamp: wave.timestamp,
            message: wave.message,
          };
        });
        console.log(cleanedWaves);
        setAllWaves(cleanedWaves);
      }
    } catch (e) {
      console.log(e);
    }
  };
  const connectToWallet = async () => {
    if (window && window?.ethereum) {
      const { ethereum } = window;
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Conencted and got accounts", accounts, accounts[0]);
      window && window.location.reload();
    } else {
      console.log("Please install metamask to connect your wallet here");
    }
  };


  const blockUser = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);

        const signer = provider.getSigner();

        const waveContract = new ethers.Contract(
          contractAddress,
          abiFile.abi,
          signer
        );

        if (!blocked) {
          console.log("Blocking");
          const block = await waveContract.block_user();
          console.log("Blocking stated...");
          await block.wait();
          console.log("Blocking completed...");

          const isBlocked = await waveContract.check_blocked();
          console.log(isBlocked);
        } else {
          console.log("unblocking....");
          const unblock = await waveContract.unblock_user();
          console.log("Unblocking... txn started..");
          await unblock.wait();
          console.log("Unblocking is completed");
          const isBlocked = await waveContract.check_blocked();
          console.log(isBlocked);

          setBlocked(isBlocked);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const wave = async () => {
    if (!msg) {
      alert("No msg to wave at other user ;)");
      return;
    }
    if (blocked) {
      alert("Sorry you got blocked you can't send message.");
      return;
    }
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);

        const signer = provider.getSigner();

        const waveContract = new ethers.Contract(
          contractAddress,
          abiFile.abi,
          signer
        );

        let count = await waveContract.getTotalWaves();
        console.log("Got waves count and it is ", count.toNumber());

        const waveTxn = await waveContract.wave(msg);

        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();

        console.log("Transaction's been done :)", waveTxn.hash);

        count = await waveContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        setMsg("");

        getAllWaves();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="wave-img">
            👋
          </span>
          Hey there!
        </div>

        <div className="bio">
          I'm mahesh learning web3 and building small projects at same time.
          Would love to get oppurtinies on web3 or front-end Jobs. Nice to meet
          you :)
        </div>

        <textarea
          placeholder="Enter your msg here"
          className="px-4 focus:border-gray-600 outline-none border-black mt-4 py-2 border-2"
          onChange={(e) => setMsg(e.target.value)}
        />

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {!currentAccount && (
          <p
            onClick={connectToWallet}
            className="mt-2 ml-auto mr-auto px-2 py-1 border-2 border-black rounded-md cursor-pointer w-max"
          >
            Connect Wallet
          </p>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div>
              <div
                key={index}
                style={{
                  backgroundColor: "OldLace",
                  marginTop: "16px",
                  padding: "8px",
                }}
              >
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>
              <p
                style={{
                  fontWeight: "bold",
                  textDecorationLine: "underline",
                  cursor: "pointer",
                  marginTop: 10,
                  userSelect: "none",
                }}
                onClick={blockUser}
              >
                {blocked ? "UnBlock" : "Block"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
