import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import ArticleCreateForm from './editor/ArticleCreateForm';
import ArticleIndex from './lists/ArticleIndex';
import ArticleUpdateForm from './editor/ArticleUpdateForm';
import Home from './Home';
import NavBar from './nav/Navbar';

import EditorContract from "../contracts/Editor.json";
import {ProtectedAuthorRoute, GenericAuthorRoute} from '../utils/route_util';
import Web3 from "web3";

import "../styles/App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: null,
      account: '0x0',
      editorContract: {},
      accountValue: 0,
      isLoading: false
    }

    this.getAccounts = this.getAccounts.bind(this);
    this.isRegisteredPublisher = this.isRegisteredPublisher.bind(this);
    this.isAuthor = this.isAuthor.bind(this);
  }

  async componentDidMount() {
    await this.getWeb3();
    await this.getBlockchainData();
  }

  async getWeb3() {
    if (window.ethereum) {
      try {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
      }
    } else if (window.web3) {
      // Legacy dapp browsers...
        window.web3 = new Web3(window.web3.currentProvider);
    } else {
      // Non-dapp browsers...
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async getBlockchainData() {
    try {
      const web3 = window.web3;

      // Use web3 to get the user's account.
      const accounts = await web3.eth.getAccounts();
      accounts.length === 1
        ? this.setState({ account: accounts[0] })
        : window.alert('More than 1 account loaded!');

      const networkId = await web3.eth.net.getId();
      const editorAddress = EditorContract.networks[networkId].address;

      // Pass contract the abi and address to get JS version of contract.
      if (editorAddress) {
        const editorContract = new web3.eth.Contract(EditorContract.abi, editorAddress);
        this.setState({editorContract})
      } else {
        window.alert('EditorContract not deployed to detected network!')
      }


      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      const weiBalance = await web3.eth.getBalance(accounts[0]);
      const ethBalance = await web3.utils.fromWei(weiBalance, 'Ether');

      this.setState({ web3: web3 });
      this.setState({ account: accounts[0] })
      this.setState({ accountValue: ethBalance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        'Failed to load web3, accounts, or contract. Check console for details.',
      );
      console.error(error);
    }
  }

  async isRegisteredPublisher() {
    if (this.state.editorContract.methods) {
      try {
        const isRegistered = await this.state.editorContract.methods.isRegisteredPublisher().call({from: this.state.account})
        return isRegistered;
      } catch(e) {
        console.log(e, 'Component: App, Method: isRegisteredPublisher');
        return false;
      }
    }
  }

  // Assume anyone who isnt a registered publisher to be an author.
  async isAuthor() {
    const result = await this.isRegisteredPublisher();
    return !result;
  }

  async getAccounts() {
    const accounts = await this.state.web3.eth.getAccounts();
    return accounts;
  }

  render() {
    return (
      <div>
        <Router>
          <NavBar account={this.state.account} />
          <Switch>
            {/* Author Private Routes // Only SPECIFIC author should need to see these. */}
            <GenericAuthorRoute
              account={this.state.account}
              editorContract={this.state.editorContract}
              component={ArticleUpdateForm}
              exact={true}
              isAuthor={this.isAuthor}
              path="/author/:author_address/articles/:id/edit"
            />

            {/* Author Public Routes - Any author can access, but not publishers. */}
            <GenericAuthorRoute
              account={this.state.account}
              component={ArticleCreateForm}
              editorContract={this.state.editorContract}
              exact={true}
              isAuthor={this.isAuthor}
              path="/author/articles/new"
            />

            {/* Anyone can see. Just will want to pass a prop to conditionally render an "edit" button if author/publisher. */}
            <Route
              exact
              path="/author/:author_address/articles"
              render={props => (
                <ArticleIndex {...props} account={this.state.account} editorContract={this.state.editorContract} />
              )}
            />
            {/* <Route exact path="/publisher/:publisher_address/team" component={TeamIndex} /> */}

            {/* The diff page for an article versus different hashes */}
            {/* <Route exact path="/author/:author_address/articles/:id" component={DiffArticle} /> */}

            {/* All of a publisher's articles */}
            {/* <Route exact path="/publisher/:publisher_address/articles" component={ArticleIndex} /> */}

            {/* All of an author's approved publishers */}
            {/* <Route exact path="/author/:author_address/publishers" component={PublishersIndex} /> */}

            {/* Root */}
            <Route
              render={(props) => <Home {...props} address={this.state.account} />}
              path="/"
              />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
