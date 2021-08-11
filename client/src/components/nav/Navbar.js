import React, { Component } from 'react';
import { Drawer, Button } from 'antd';

class NavBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    }

    this.handleNavClick = this.handleNavClick.bind(this);
  }

  toggleDrawer() {
    this.setState({visible: !this.state.visible});
  }

  handleNavClick() {
    this.toggleDrawer();
    // Do navigation based on argument
  }

  render() {
    return (
      <div>
        <Button placement="right" type="primary" onClick={() => this.toggleDrawer()}>
          Open
        </Button>
        <Drawer
          title="Welcome"
          placement="right"
          closable={false}
          onClose={() => this.toggleDrawer()}
          visible={this.state.visible}
          >
          <p onClick={this.handleNavClick}>My Articles</p>
          <p onClick={this.handleNavClick}>My Publishers</p>
          <p onClick={this.handleNavClick}>Explore Articles</p>
        </Drawer>
      </div>
    );
  }
};

export default NavBar;