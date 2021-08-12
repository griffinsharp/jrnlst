
import React, { Component } from 'react'
// import client from '../../utils/ipfs';
// import TextBox from './TextBox';

import './Modal.css';

class Modal extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  }

  render() {

    return (
      <div className="Modal--container">
        <div >
            <h2 className="Modal--title">
                Success
            </h2>
        </div>

        <div className="Modal--body">
            <p >
                Your article, <b><i>{this.props.articleName}</i></b>, was successfully submitted and can be found with the transaction hash below.
            </p>
        </div>
        <div className="Modal--body">
            <div><b>Etherscan</b></div>
            <a href={`https://etherscan.io/address/${this.props.txnHash}`}>
                {this.props.txnHash}
            </a>
        </div>
        <div className="Modal--body">
            <div><b>IPFS</b></div>
            <a href={`https://ipfs.io/ipfs/${this.props.ipfsHash}`}>
                {this.props.ipfsHash}
            </a>
        </div>
        <div className="Modal--button--container">
            <button onClick={() => this.props.dismissModal()} className="Modal--button">
                Dismiss
            </button>
        </div>
      </div>
    );
  }
}

export default Modal;
