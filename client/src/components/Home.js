import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Button } from 'antd';

import { FileSearchOutlined } from '@ant-design/icons';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {}


  }

  render() {
    return(
      <div>
        <Link to="/author/articles/new">
          <Button type="primary">New Article</Button>
        </Link>
        <Button type="default">Update Article</Button>
        <Button icon={<FileSearchOutlined />} type="dashed">Search Articles</Button>
      </div>
    )
  }

}

export default Home;