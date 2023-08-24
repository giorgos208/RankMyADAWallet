import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Advertisement from './Advertisement';
import Footer from './Footer';

function App() {
    const [address, setAddress] = useState('');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [setValue, setTweetValue] = useState('Hey #Cardano!\n\nDid you know you could check your $ADA wallet ranking on rankmywallet.xyz?');

    function createTwitterLink() {
        const tweetText = encodeURIComponent(setValue); // This ensures the text is URL-safe
        return `https://twitter.com/intent/tweet?text=${tweetText}`;
      }

      function updateTweetWithNewRank(newRank) {
        setTweetValue(`Check out my new rank on #Cardano wallet ranking!\nI'm now ranked #${newRank}.\n\nCheck your ranking now by visiting: rankmywallet.xyz`);
      }

    const getImageBasedOnRank = (rank) => {
        const rankInt = parseInt(rank, 10); // Convert rank to integer
        const multiplier = 1000000
        
        if(Math.floor(rankInt/multiplier) < 5000) {
            return "/shrimp.png";
        } else if(Math.floor(rankInt/multiplier) >= 5000 && Math.floor(rankInt/multiplier) < 25000) {
            return "/piranha.png";
        } 
        else if(Math.floor(rankInt/multiplier) >= 25000 && Math.floor(rankInt/multiplier) < 100000) {
            return "/swordfish.png";
        }
        else if(Math.floor(rankInt/multiplier) >= 100000 && Math.floor(rankInt/multiplier) < 250000) {
            return "/shark.png";
        }
        else if(Math.floor(rankInt/multiplier) >= 250000 && Math.floor(rankInt/multiplier) < 1000000) {
            return "/orca.png";
        }    
        else {
            return "/whale.png";
        }
    }
    
    const fetchData = async (givenAddress = address) => {
        try {
            const response = await axios.post('https://wenlobster.online/fetchRank', { address: givenAddress });
            setData(response.data);
            updateTweetWithNewRank(response.data.rank)
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
            setData(null);
        }
    };

    const handleFetchRank = async () => {
        const currentAddress = address;
     
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'project_id': "mainnetOCVBj0m88walQJyKSJgwfXP7pesIoHje"
            },
        };
    
        if (currentAddress.startsWith('addr')) {
            try {
                const response = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${currentAddress}`, requestOptions);
                const data = await response.json();
                
                if (data.stake_address) {
                    setAddress(data.stake_address);
                    console.log("Converted wallet address to stake address: ",data.stake_address)
                    fetchData(data.stake_address);
                } 

                else {
                    // Handle error
                }
            } catch (error) {
                // Handle the API error
            }
        } else if (currentAddress.startsWith('stake')) {
            console.log("Searching for stake address: ",currentAddress)
            setAddress(currentAddress)
            fetchData(currentAddress);
        } 
         
                //
                else if (currentAddress.startsWith('$')) {
                    console.log("Received handle: ", currentAddress)
                    // Convert the string after $ to hex
                    const strToHex = (str) => [...str].map(char => char.charCodeAt(0).toString(16)).join('');
                    const hexValue = strToHex(currentAddress.slice(1));
                    const policy_ID = "f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a"

                    const combinedString = policy_ID + hexValue;

                    try {
                        const assetResponse = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/assets/${combinedString}/addresses`, requestOptions);
                        const assetAddresses = await assetResponse.json();
            
                        if (assetAddresses && assetAddresses.length > 0) {
                            const assetAddress = assetAddresses[0].address;
                            
                            const response = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${assetAddress}`, requestOptions);
                            const data = await response.json();
            
                            if (data.stake_address) {
                                setAddress(data.stake_address);
                                console.log("Converted handle to stake address: ",currentAddress, " ", data.stake_address);
                                fetchData(data.stake_address);
                            } else {
                                setError("Handle doesn't exist");
                            }
                        } else {
                            setError("Handle doesn't exist");
                        }
            
                    } catch (error) {
                        setError("Handle doesn't exist");
                    }
            
                }
        else {
            // Handle invalid input
        }
    };
    

    return (
        <div className="App">
        <Advertisement link="https://www.twitter.com/adaorca1" text="DM on Twitter to become a Sponsor!!" imageSrc="/ad.gif" />
        <h1>Cardano Wallet Ranking</h1>
        <h3>*Only takes into account STAKED wallets*</h3>
    
        {data && <img src={getImageBasedOnRank(data.live_stake)} alt="Rank-based depiction" />}
        
        {data && (
            <div className="results">
                <p><strong>Balance:</strong> {Math.round(parseInt(data.live_stake, 10) / 1000000).toLocaleString()} $ADA</p>
                <p className="rank"><span className="goldenText"><strong>Rank:</strong></span> {parseInt(data.rank, 10).toLocaleString()}</p>



            </div>
        )}
    
        <div className="inputContainer">
            <input 
                type="text" 
                value={address} 
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter $handle or wallet address (or stake address).." 
            />
           <button onClick={handleFetchRank}>Fetch Rank</button>

        </div>
        <a href={createTwitterLink()} target="_blank" rel="noopener noreferrer" className="twitter-share-button">
    Share on Twitter
</a>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Footer />
    </div>
  
    
    
    

    
    );
}

export default App;
