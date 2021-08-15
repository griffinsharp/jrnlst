import React, { Component } from 'react';
import { Link } from "react-router-dom";

import { Button } from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';

import './global.css';

// Can be made into a functional component, unless state is added.
class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {}
  }

  render() {
    return(
      <div class="flexAlignItems flexCol">
        <p>Welcome! Click below to get started.</p>
        <div class="flexJustifyCenter">
          <Link to="/author/articles/new">
            <Button type="primary">New Article</Button>
          </Link>
          <Button type="default">Update Article</Button>
          <Button icon={<FileSearchOutlined />} type="dashed">Search Articles</Button>
        </div>
      </div>
    )
  }

}

export default Home;