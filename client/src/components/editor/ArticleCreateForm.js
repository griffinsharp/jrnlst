
import React, { Component } from 'react'

import TextBox from './TextBox';

import client from '../../utils/ipfs';

class ArticleCreate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      articleName: '',
      publicationAddress: '',
      isLoading: false
    }

    this.uploadFileToIPFS = this.uploadFileToIPFS.bind(this);
  }

  async uploadFileToIPFS(text) {
    this.setState({isLoading: true});

    try {
      console.log("uploading...")
      const file = await client.add(text);
      const uploadedFile = await this.uploadFileToContract(file.path, this.state.articleName, this.state.publicationAddress);

      console.log(uploadedFile);
      this.setState({isLoading: false});
    } catch(e) {
      this.setState({isLoading: false});
      console.log(e);
    }
  }

  // async needed?
  async uploadFileToContract(articleCID, articleName, publicationAddress) {
    const hexArticleCID = window.web3.utils.asciiToHex(articleCID)
    this.props.editorContract.methods.postArticle(hexArticleCID, articleName, publicationAddress).send({ from: this.props.account }).on('transactionHash', (hash) => {
      console.log('transactionHash: ', hash);
    })
  }


  render() {
    return (
      <div>
        <div>
          Article Name:
          <input
            value={this.state.articleName}
            onChange={(e) => this.setState({ articleName: e.target.value })}
            placeholder="Enter the name of the article."
          />
        </div>
        <div>
          Publication Address:
          <input
            value={this.state.publicationAddress}
            onChange={(e) => this.setState({ publicationAddress: e.target.value })}
            placeholder="Enter a registered publication's address. Use 0x000000000000000000000000000000000000dEaD if self-published."
          />
        </div>
        <TextBox isLoading={this.state.isLoading} uploadFileToIPFS={this.uploadFileToIPFS} />
      </div>
    );
  }
}

export default ArticleCreate;
