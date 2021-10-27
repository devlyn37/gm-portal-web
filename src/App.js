import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/GmPortal.json';
import LoadingIndicator from "./components/LoadingIndicator/index.js"

export default function App() {
  const contractAddress = "0x654E4E388388Be3b22B51fc70e9FbD720dCd43bd";
  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = useState("");
  const [loadingGms, setLoadingGms] = useState(false);
  const [allGms, setAllGms] = useState([]);
	const [lastGm, setLastGm] = useState(null);
  const [messageVal, setMessageVal] = useState("");

  const handleMessageChange = (event) => {
    setMessageVal(event.target.value);
  }

  const getAllGms = async (currentAccount) => {
    try {
      setLoadingGms(true)
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gmPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const gms = await gmPortalContract.getAllGms();

        let gmsCleaned = [];
				let lastGm = null;

        gms.forEach(gm => {
					const cleaned = {
						address: gm.gmer,
            timestamp: new Date(gm.timestamp * 1000),
            message: gm.message,
						status: gm.status
					}

					if(cleaned.address.toUpperCase() === currentAccount.toUpperCase()){
						lastGm = cleaned;
					}
					
          gmsCleaned.push(cleaned);
        })

				setLastGm(lastGm);
        setAllGms(gmsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (e) {
      console.log(e);
    }

    setLoadingGms(false);
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    let gmPortalContract;

    const onNewGm = (from, timestamp, message, status) => {
      console.log('NewGm', from, timestamp, message);
			const newGm = {
				address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
				status: status,
			}

      setAllGms(prevState => [
        ...prevState,
        newGm
      ]);

			if(from.toUpperCase() === currentAccount.toUpperCase()){
				setLastGm(newGm)
				setLoadingGms(false);
			}
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      gmPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
			gmPortalContract.off('NewGm', onNewGm);
      gmPortalContract.on('NewGm', onNewGm);
    }

    return () => {
      if (gmPortalContract) {
        gmPortalContract.off('NewGm', onNewGm);
      }
    };
  }, [currentAccount])

  useEffect(() => {
    if (currentAccount) {
      getAllGms(currentAccount);
    }
  }, [currentAccount])

  const gm = async (message) => {
    try {
      setLoadingGms(true);
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gmPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const gmTxn = await gmPortalContract.gm("gm and " + message, { gasLimit: 300000 });
        console.log("Mining...", gmTxn.hash);

        await gmTxn.wait();
        console.log("Mined -- ", gmTxn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
			setLoadingGms(false)
    }
  }

	const alreadyPostedToday = lastGm ? Date.now() - lastGm.timestamp.getTime() <= 23 * 60 * 60 * 1000 : false;
	const statusToString = (status) => {
		if(status === 0){
			return "Come back tomorrow for a chance to win 0.0001 ETH"
		}else if(status === 1){
			return "You won 0.0001 ETH today :)"
		}else if(status === 2){
			return "Try again tomorrow :)"
		}
		return ""
	}


  const gms = allGms.map((gm, i) =>
    (
      <div key={i} style={{ 
				backgroundColor: "OldLace", 
				marginTop: i === 0 ? "4px" : "16px", 
				padding: "8px" 
			}}>
        <div>Address: {gm.address}</div>
        <div>Time: {gm.timestamp.toString()}</div>
        <div>Message: {gm.message}</div>
      </div>)
  )

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          🔆 gm!
        </div>

        <div className="bio">
          "We say good morning to each other because we are a friendly happy optimistic global community and it is nice to say good morning to your friends as you start your day" - 6529
        </div>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet} style={{ margin: "20px 0px" }}>
            Connect Wallet
          </button>
        )}

        {currentAccount && (
          <div style={{ 
						display: "flex", 
						justifyContent: "center", 
						alignItems: "center", 
						margin: "20px 0px" 
					}}>
						{ lastGm && alreadyPostedToday ? `Thanks for posting! ${statusToString(lastGm.status)}` :
							<>
								<input type="text"
									name="name" 
									placeholder="Enter a message" 
									onChange={handleMessageChange} 
									style={{ 
										padding: "12px",
										border: "none", 
										backgroundColor: "#f2f2f2", 
										borderRadius: "15px", 
										flex: 1, 
										marginRight: "12px",
										minWidth: "50px"
										}}/>
								<button className="waveButton" disabled={loadingGms} onClick={() => { gm(messageVal) }}>
									{loadingGms ? "..." : "Say gm"}
								</button>
							</>
						}
          </div>
        )}

        {currentAccount && (
          <div 
						style={{ 
							padding: "30px 0px", 
							borderTop: "2px solid #f2f2f2"
					 	}}>
            {loadingGms ? 
							(
								<div style={{ display: "flex", 
									justifyContent: "center", 
									alignItems: "center" 
								}}>
									<LoadingIndicator />
								</div>
							):(
                <>
                  <div className="total" style={{ marginBottom: "15px" }}>
                    {allGms.length} gm
                  </div>
                  {gms}
                </>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
