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

  // LIFECYCLE
  async componentDidMount() {
    if (this.props.editorContract.methods) {
      this.getArticleHashAndText();
      this.getArticles();
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.props.editorContract !== prevProps.editorContract) {
      this.getArticleHashAndText();
      this.getArticles();
    }
  }

  async getFromIPFS(hashToGet) {
    for await (const file of client.get(hashToGet)) {

      if (!file.content) continue;
      const content = new BufferList();

      for await (const chunk of file.content) {
        content.append(chunk)
      }

      return content
    }
  }

  getArticleHashAndText = () => {
    this.props.editorContract.methods.getHashesFromArticleId(this.props.match.params.id).call().then((articleHash) => {
      const lastIpfsHash = window.web3.utils.hexToAscii(articleHash[ articleHash.length - 1 ]);
      this.getFromIPFS(lastIpfsHash).then(article => {
        this.setState({article: article.toString(), ipfsHash: lastIpfsHash})
      });
    });
  }

  getArticles = () => {
    this.props.editorContract.methods.getArticles().call().then((articles) => {
      const currentArticle = articles[this.props.match.params.id]
      this.setState({
        articleName: currentArticle[0],
        publicationAddress: currentArticle[2],
      })
    });
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

  // VIEW
  _getModalView() {
    return (
      <div>
        <div className="ArticleCreateForm--modal" onClick={() => this.setState({ showModal: false })} />
        <Modal dismissModal={() => this.setState({ showModal: false })} txnHash={this.state.txnHash} articleName={this.state.articleName} ipfsHash={this.state.ipfsHash}>
          Your article, <b><i>{this.state.articleName}</i></b>, was successfully updated and can be found with the transaction hash below.
        </Modal>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.state.showModal && this._getModalView()}

        <div>
          <div>
            <h1>{this.state.articleName}</h1>
            <h3>Publication Address: {this.state.publicationAddress}</h3>
          </div>
          <TextBox isLoading={this.state.isLoading} uploadFileToIPFS={this.uploadFileToIPFS} value={this.state.article}/>
        </div>
      </div>
    );
  }
}

export default ArticleUpdateForm;
