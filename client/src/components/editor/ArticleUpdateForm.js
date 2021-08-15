import React, { Component } from 'react'
import client from '../../utils/ipfs';
import Modal from '../modal/Modal';
import TextBox from './TextBox';
import BufferList from 'bl';

import './ArticleCreateForm.css';

class ArticleUpdateForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articleName: '',
      publicationAddress: '',
      isLoading: false,
      showModal: false,
      txnHash:'0x0000000000000000000000000000000000000000',
      ipfsHash: '',
      article: '',
    }
    this.uploadFileToIPFS = this.uploadFileToIPFS.bind(this);
  }

  async getFromIPFS(hashToGet) {
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

  getArticleHash = () => {
    const articleHashPromise = this.props.editorContract.methods.getArticleHash(this.props.match.params.id).call().then((articleHash) => {
      this.setState({
        ipfsHash: window.web3.utils.hexToAscii(articleHash[articleHash.length - 1])
      });
    });
  }

  getArticles = () => {
    const articlesPromise = this.props.editorContract.methods.getArticles().call().then((articles) => {
      const currentArticle = articles[this.props.match.params.id]
      this.setState({
        articleName: currentArticle[0],
        publicationAddress: currentArticle[2],
      })
    });
  }

  async componentDidUpdate(prevProps, prevState) {
    // Cannot use onMount here because App needs a moment to async fetch web3 and the contract.
    if (this.props.editorContract !== prevProps.editorContract) {
        this.getArticleHash();
        this.getArticles();
    }
    if (prevState.ipfsHash != this.state.ipfsHash) {
      const article = await this.getFromIPFS(this.state.ipfsHash);
      this.setState({article: article.toString()})
    }
  }

  async uploadFileToIPFS(text) {
    this.setState({isLoading: true});
    try {
      console.log("uploading...")
      const file = await client.add(text);
      this.updateFileOnContract(file.path);
      this.setState({isLoading: false, ipfsHash: file.path});
    } catch(e) {
      this.setState({isLoading: false});
      console.log(e);
    }
  }

  updateFileOnContract(articleCID) {
    const hexArticleCID = window.web3.utils.asciiToHex(articleCID)
    this.props.editorContract.methods.updateArticle(this.props.match.params.id, hexArticleCID).send({ from: this.props.account }).on('transactionHash', (hash) => {
      console.log('transactionHash: ', hash);
      this.setState({showModal: true, txnHash: hash});
    })
  }

  render() {
    return (
      <>
      {this.state.showModal && (
        <>
          <div className="ArticleCreateForm--modal" onClick={() => this.setState({showModal: false})}/>
          <Modal dismissModal={() => this.setState({showModal: false})} txnHash={this.state.txnHash} articleName={this.state.articleName} ipfsHash={this.state.ipfsHash} >
            Your article, <b><i>{this.state.articleName}</i></b>, was successfully updated and can be found with the transaction hash below.
          </Modal>
        </>
      )}

      <div>
        <div>
          <h1>
            {this.state.articleName}
          </h1>
          <h3>
            Publication Address: {this.state.publicationAddress}
          </h3>
        </div>
        <TextBox isLoading={this.state.isLoading} uploadFileToIPFS={this.uploadFileToIPFS} value={this.state.article}/>
      </div>
      </>
    );
  }
}

export default ArticleUpdateForm;
