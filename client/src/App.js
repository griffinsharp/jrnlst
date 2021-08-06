import React, { useState, useEffect } from 'react'
import { Row, Col, Input, Button, Spin } from 'antd';
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import client from './ipfs';
import "./App.css";

const { TextArea } = Input;

function App() {
  const [storageValue, setStorageValue] = useState(0);
  const [web3, setWeb3] = useState();
  const [accounts, setAccounts] = useState();
  const [contract, setContract] = useState();
  const [data, setData] = useState();
  const [accountValue, setAccountValue] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(()=>{
    async function getWeb3Config() {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
  
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
  
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = SimpleStorageContract.networks[networkId];
        const instance = new web3.eth.Contract(
          SimpleStorageContract.abi,
          deployedNetwork && deployedNetwork.address,
        );

        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        const weiBalance = await web3.eth.getBalance('0x453C1553f5a54ED7A9FEaD0Ed7F97aE8b47918b8');
        const ethBalance = await web3.utils.fromWei(weiBalance, 'Ether');

        setWeb3(web3);
        setAccounts(accounts);
        setContract(instance);
        setAccountValue(ethBalance);
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    }
    getWeb3Config();
  },[])

  return !web3 ? (
    <div>Loading Web3, accounts, and contract...</div>
  ) : (
    <>
      <div className="App">
        <div>{accountValue} ETH</div>
        <div>Enter sensitive data:</div>
        <div>
          <TextArea style={{width: "60%", height: "600px"}} value={data} onChange={(e)=>{
              setData(e.target.value)
          }} />
          <div>
            <button style={{width:"60%"}} loading={false} size="large" shape="round" type="primary" onClick={async()=>{
              console.log("uploading...")
              const { cid } = await client.add(data);
              console.log('cid: ', cid.toString());
            }}>Upload to IPFS</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
