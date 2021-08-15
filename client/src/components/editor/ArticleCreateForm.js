import React, { Component } from 'react'
import client from '../../utils/ipfs';
import Modal from '../modal/Modal';
import TextBox from './TextBox';

import './ArticleCreateForm.css';

class ArticleCreateForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      articleName: '',
      publicationAddress: '',
      isLoading: false,
      showModal: false,
      txnHash:'0x0000000000000000000000000000000000000000',
      ipfsHash: ''
    }

    this.uploadFileToIPFS = this.uploadFileToIPFS.bind(this);
  }

  async uploadFileToIPFS(text) {
    this.setState({isLoading: true});

    try {
      console.log("uploading...")
      const file = await client.add(text);

      this.uploadFileToContract(file.path, this.state.articleName, this.state.publicationAddress);
      this.setState({isLoading: false, ipfsHash: file.path});
    } catch(e) {
      this.setState({isLoading: false});
      console.log(e);
    }
  }

  uploadFileToContract(articleCID, articleName, publicationAddress) {
    const hexArticleCID = window.web3.utils.asciiToHex(articleCID)
    this.props.editorContract.methods.postArticle(hexArticleCID, articleName, publicationAddress).send({ from: this.props.account }).on('transactionHash', (hash) => {
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
            Your article, <b><i>{this.state.articleName}</i></b>, was successfully submitted and can be found with the transaction hash below.
          </Modal>
        </>
      )}

      <div>
        <div className="ArticleCreateForm--flex--box">
          <div>
            <div>
              Article Name:
            </div>
            <div>
              Publication Address:
            </div>
          </div>
          <div>
            <div>
              <input
                className="ArticleCreateForm--input"
                value={this.state.articleName}
                onChange={(e) => this.setState({ articleName: e.target.value })}
                placeholder="Enter the name of the article."
              />
            </div>
            <div>
              {/* TODO: Will want to have form validation here if we have time to prevent submissions with empty values, ask if they want to use 0x0 as a publisher, etc. */}
              <input
                className="ArticleCreateForm--input"
                value={this.state.publicationAddress}
                onChange={(e) => this.setState({ publicationAddress: e.target.value })}
                placeholder="Use 0x0000000000000000000000000000000000000000 if self-published."
              />
              <button className="ArticleCreateForm--button" onClick={() => this.setState({publicationAddress: "0x0000000000000000000000000000000000000000"})}>Fill with default address</button>
            </div>
          </div>
        </div>
        <TextBox isLoading={this.state.isLoading} uploadFileToIPFS={this.uploadFileToIPFS} />
      </div>
      </>
    );
  }
}

export default ArticleCreateForm;
