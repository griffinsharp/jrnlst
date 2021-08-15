import React, { Component } from 'react';

import client from '../../utils/ipfs';
import * as BufferList from 'bl';
import * as Diff from 'diff';

import './ArticleDiff.css';
import '../global.css';

import { Form, Card, Button, Select } from 'antd';
const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};


class ArticleDiff extends Component {
  constructor(props) {
    super(props);

    this.state = {
      articleOneText: '',
      articleTwoText: '',
      articleOneHash: '',
      articleTwoHash: '',
      isLoading: true,
      hashes: []
    }

    this.formRef = React.createRef();
  }

  // LIFECYCLE
  // TODO: This may be a bit hacky, not sure if there's a cleaner solution other than refetching web3 onMount.
  // Depending on where you navigate from, the contract is either defined on mount or not due to async web3 call in App/routing.
  // Have componentDidMount and componentDidUpdate conditions to solve for this.
  componentDidMount() {
    if (this.props.editorContract.methods) {
      this.getHashesForArticleId(this.props.editorContract, this.props.match.params.id);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.editorContract !== prevProps.editorContract) {
      this.getHashesForArticleId(this.props.editorContract, this.props.match.params.id);
    }
  }

  async getArticleIPFSText(hashToGet) {
    for await (const file of client.get(window.web3.utils.hexToAscii(hashToGet))) {
      if (!file.content) continue;
      const content = new BufferList ()
      for await (const chunk of file.content) {
        content.append(chunk)
      }
      return content.toString();
    }
  }

  async getHashesForArticleId(contract, articleId) {
    if (!this.state.isLoading) this.setState({isLoading: true});

    try {
      const articleHashes = await contract.methods.getHashesFromArticleId(articleId).call();
      this.setState({hashes: articleHashes});
      this.setState({isLoading: false});
    } catch(e) {
      this.setState({isLoading: false});
      console.log(e);
    }
  }

  // TODO: Do more testing on this to make sure its clearing properly!
  async onArticleChange(field, value) {
    let obj = {};
    obj[field] = value;
    this.formRef.current.setFieldsValue(obj);

    if (this.state.hashes.indexOf(this.formRef.current.getFieldValue('articleOneHash')) > this.state.hashes.indexOf(this.formRef.current.getFieldValue('articleTwoHash'))) {
      this.setState(obj);

      const text = await this.getArticleIPFSText(value);
      (field === 'articleOneHash')
        ? this.setState({ articleOneText: text })
        : this.setState({ articleTwoText: text });

    } else {
      this.setState({articleTwoHash: ''});
    }
  };

  onReset() {
    this.formRef.current.resetFields();
    this.setState({articleOneText: '', articleTwoText: '', articleOneHash: '', articleTwoHash: ''})
  };

  hashOneNotSelected() {
    return (!this.formRef.current || !this.formRef.current.getFieldValue('articleOneHash'));
  }

  _getAvailableHashes(hashes) {
    if (this.hashOneNotSelected()) return [];
    const hashOneIndex = hashes.indexOf(this.formRef.current.getFieldValue('articleOneHash'));
    return hashes.slice(0, hashOneIndex);
  }

  // TODO: Rework
  _getDiffView() {
    if (!this.state.articleOneText || !this.state.articleTwoText) return (<div className="noBorderWrapper"><Card title="Comparing Articles" bordered={false} className='width100'>Select two articles to compare above.</Card></div>);
    const diff = Diff.diffSentences(this.state.articleTwoText, this.state.articleOneText);
    let collectedNodes = [];
    diff.forEach((part) => {
      const color = part.added ? 'green' :
        part.removed ? 'red' : 'grey';

      const span = <span style={{color: color}}>{part.value}</span>
      collectedNodes.push(span);
    });

    return (
      <div className="noBorderWrapper">
        <Card title="Comparing Articles" bordered={false} className='width100'>
          {[...collectedNodes]}
        </Card>
      </div>
    );
  }

  render() {
    return(
      <div>
        <Form {...layout} ref={this.formRef} name="control-ref">

          {/* Article #1 */}
          <Form.Item name="articleOneHash" label="Article #1" rules={[ { required: true } ]}>
            <Select
              className='maxWidth50'
              placeholder="Select a version."
              onChange={(value) => this.onArticleChange('articleOneHash', value)}
              allowClear
              >
              {this.state.hashes.map((hash, index) => <Option key={index} value={hash}>version #{index + 1} - {window.web3.utils.hexToAscii(hash)}</Option>)}
            </Select>
          </Form.Item>

          {/* Article #2 */}
          <Form.Item name="articleTwoHash" label="Article #2" rules={[ { required: true } ]}>
            <Select
              className='maxWidth50'
              disabled={this.hashOneNotSelected()}
              placeholder="Select another version (with a lower version number)."
              onChange={(value) => this.onArticleChange('articleTwoHash', value)}
              allowClear
              >
              {this._getAvailableHashes(this.state.hashes).map((hash, index) => <Option key={index} value={hash}>version #{index + 1} - {window.web3.utils.hexToAscii(hash)}</Option>)}
            </Select>
          </Form.Item>

          {/* Buttons */}
          <Form.Item {...tailLayout}>
            <Button htmlType="button" onClick={() => this.onReset()}>
              Reset
            </Button>
          </Form.Item>
        </Form>

        {this._getDiffView()}
      </div>
    );
  }
}

export default ArticleDiff;
