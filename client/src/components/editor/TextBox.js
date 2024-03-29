import React, { Component } from 'react'
import { Input } from 'antd';
const { TextArea } = Input;

class TextBox extends Component {
  constructor(props) {
    super(props);
    // TODO: Fix mixing props and state.
    this.state = {
      text: null
    }
  }

  render() {
    return (
      <div>
        <TextArea
          style={{ width: "60%", height: "600px" }}
          value={this.state.text != null ? this.state.text : this.props.value}
          onChange={(e) => this.setState({ text: e.target.value })}
        />
        <div>
          <button
            disabled={this.props.isLoading}
            style={{ width: "60%" }}
            size="large"
            shape="round"
            type="primary"
            onClick={() => this.props.uploadFileToIPFS(this.state.text)}>Upload to IPFS</button>
        </div>
      </div>
    );
  }
}

export default TextBox;
