import React, { useState, useEffect } from 'react'
import { Row, Col, Input, Button, Spin } from 'antd';
import Editor from "./contracts/Editor.json";
import getWeb3 from "./getWeb3";
import client from './ipfs';
import "./App.css";
const { BufferList } = require('bl')
const { TextArea } = Input;

const getFromIPFS = async hashToGet => {
  for await (const file of client.get(hashToGet)) {
    console.log(file.path)
    if (!file.content) continue;
    const content = new BufferList()
    for await (const chunk of file.content) {
      content.append(chunk)
    }
    console.log(content)
    return content
  }
}

function App() {
  const [storageValue, setStorageValue] = useState(0);
  const [web3, setWeb3] = useState();
  const [accounts, setAccounts] = useState();
  const [contract, setContract] = useState();
  const [data, setData] = useState();
  const [publicationAddress, setPublicationAddress] = useState();
  const [accountValue, setAccountValue] = useState(0);
  const [editorContract, setEditorContract] = useState();

  useEffect(()=>{
    async function getWeb3Config() {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Editor.networks[networkId];
        const instance = new web3.eth.Contract(
          Editor.abi,
          deployedNetwork && deployedNetwork.address,
        );

        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.

        const weiBalance = await web3.eth.getBalance(accounts[0]);
        const ethBalance = await web3.utils.fromWei(weiBalance, 'Ether');

        if(deployedNetwork) {
          const editorContract = new web3.eth.Contract(Editor.abi, deployedNetwork.address);
          setEditorContract(editorContract);
        } else {
          window.alert('Editor contract not deployed to detected network.')
        }

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

  const uploadFile = (articleCID, publicationAddress) => {
    const hexArticleCID = web3.utils.asciiToHex(articleCID)
    editorContract.methods.postArticle(hexArticleCID, publicationAddress).send({ from: accounts[0] }).on('transactionHash', (hash) => {
      console.log('transactionHash: ', hash);
    })
  }

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
            Publication Address:
            <input value={publicationAddress} onChange={(e)=>{
                setPublicationAddress(e.target.value)
            }} />
          </div>
          <div>
            <button style={{width:"60%"}} loading={false} size="large" shape="round" type="primary" onClick={async()=>{
              console.log("uploading...")
              const file = await client.add(data);
              await uploadFile(file.path, publicationAddress);
              // const file = await getFromIPFS(cid);
              // console.log('file: ', file.toString());
            }}>Upload to IPFS</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
