import React, { Component } from 'react';
import { Link } from "react-router-dom";

import { Drawer, Button } from 'antd';
import { CloseOutlined, MenuFoldOutlined } from '@ant-design/icons';

import '../global.css';

class NavBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    }
  }

  toggleDrawer() {
    this.setState({visible: !this.state.visible});
  }

  render() {
    return (
      <div className='flexSpaceBetween'>
        <div><Link to='/'>LOGO</Link></div>
        <div>
          <Button
            size='large'
            icon={<MenuFoldOutlined />}
            placement='right'
            type='primary'
            onClick={() => this.toggleDrawer() }
            >
            Explore
          </Button>
          <Drawer
            title="✍️ &nbsp; Welcome!"
            placement="right"
            closable={true}
            closeIcon={<CloseOutlined />}
            onClose={() => this.toggleDrawer()}
            visible={this.state.visible}
            >
            <Link to={`/author/${this.props.account}/articles`} >
              <p onClick={() => this.toggleDrawer()}>My Articles</p>
            </Link>

            {/* Add links to the below once views are built. */}
            <p onClick={() => this.toggleDrawer()}>My Publishers</p>
            <p onClick={() => this.toggleDrawer()}>Explore Articles</p>
          </Drawer>
        </div>
      </div>
    );
  }
};

export default NavBar;