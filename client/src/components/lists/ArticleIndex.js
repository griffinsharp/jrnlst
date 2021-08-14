import React, { Component } from 'react'
import { Link } from "react-router-dom";

import { dateToTimeString } from '../../utils/dateFormat';

import { List, Avatar, Button, Skeleton } from 'antd';
import './ArticleIndex.css';

class ArticleIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      isLoading: true
    }
  }

  // LIFECYCLE
  // TODO: This may be a bit hacky, not sure if there's a cleaner solution other than refetching web3 onMount.
  // Depending on where you navigate from, the contract is either defined on mount or not due to async web3 call in App/routing.
  // Have componentDidMount and componentDidUpdate conditions to solve for this.
  componentDidMount() {
    if (this.props.editorContract.methods) {
      this.fetchArticles(this.props.editorContract, this.props.match.params.author_address);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.editorContract !== prevProps.editorContract) {
      this.fetchArticles(this.props.editorContract, this.props.match.params.author_address);
    }
  }

  async fetchArticles(contract, authorAddress) {
    const articleIds = await contract.methods.getArticleIdsFromAuthorAddress(authorAddress).call();
    if (!articleIds.length) {
      this.setState({isLoading: false});
    } else {
      const returnedArr = await articleIds.map(async (id) => {
        const article = await contract.methods.articles(id).call();
        return {
          authorAddress: article.authorAddress,
          articleId: id,
          articleName: article.articleName,
          publicationAddress: article.publicationAddress,
          timePosted: article.timePosted,
          timeUpdated: article.timeUpdated
        };
      });

      Promise.all(returnedArr).then(articles => this.setState({articles, isLoading: false}));
    }
  }

  // PRIVATE
  _getLinks(article) {
    const editLink = <Link to={`/author/${article.authorAddress}/articles/${article.articleId}/edit`}>edit</Link>;
    const viewLink = <Link to={`/author/${article.authorAddress}/articles/${article.articleId}`}>view</Link>;
    return this.props.account === article.authorAddress ? [editLink, viewLink] : [viewLink];
  }

  // VIEW
  _getArticlesListView() {
    if (!this.state.articles.length && !this.state.isLoading) return this._getNoArticlesView();
    return (
      <List
        className="margin45"
        loading={this.state.isLoading}
        itemLayout="horizontal"
        // loadMore={loadMore} - TODO: Can add pagiation later.
        dataSource={this.state.articles}
        renderItem={item => (
          <List.Item
            actions={this._getLinks(item)}
          >
            <Skeleton title={false} loading={!item.articleName} active>
              <List.Item.Meta
                title={<a href="https://ant.design">{item.articleName}</a>}
                description={`unique id: ${item.articleId}`}
              />
              <div>
                <span>posted: </span>
                <span className="articleDate">{dateToTimeString(item.timePosted)}</span>
                <span> | </span>
                <span>updated: </span>
                <span className="articleDate">{dateToTimeString(item.timeUpdated)}</span>
              </div>
            </Skeleton>
          </List.Item>
        )}
      />
    );
  }

  _getNoArticlesView() {
    const isUser = (this.props.account === this.props.match.params.author_address);
    return isUser
      ? <p>You have not authored any articles yet. <Link to={`/author/articles/new`}>Click here to write your first!</Link></p>
      : <p>User has not authored any articles yet.</p>;
  }

  render() {
    return (
      <div>
        {this._getArticlesListView()}
      </div>
    );
  }

}

export default ArticleIndex;
