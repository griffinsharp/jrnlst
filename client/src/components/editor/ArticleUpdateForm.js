import React, { Component } from 'react';
import client from '../../utils/ipfs';
import { BufferList } from 'bl';

class ArticleUpdateForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
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

  render() {
    return(
      <div>
        ARTICLE UPDATE!
      </div>
    )
  }
}

export default ArticleUpdateForm;