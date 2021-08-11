import React from "react";
import { Route, Redirect, withRouter } from "react-router-dom";

const genericAuthor = ({ account, component: Component, editorContract, exact, isAuthor, path }) => (
  <Route
    path={path}
    exact={exact}
    render={
      props => isAuthor() ? <Component {...props} account={account} editorContract={editorContract} /> : <Redirect to="/" />
    }
  />
);

// const publisher = ({ component: Component, path, loggedIn, exact }) => (
//   <Route
//     path={path}
//     exact={exact}
//     render={
//       props => loggedIn ? <Component {...props} /> : <Redirect to="/" />
//     }
//   />
// )

// Make sure address matches the one in the URL. Contract had modifier for this as safety, this is more-so UX.
const protectedAuthor = ({ component: Component, exact, getAccounts, path }) => (
  <Route
    path={path}
    exact={exact}
    render={
      async props => {
        const accounts = await getAccounts();
        return (accounts.length === 1 && props.match.params.author_address === accounts[0])
          ? <Component {...props} />
          : <Redirect to="/" />
      }
    }
  />
);


export const GenericAuthorRoute = withRouter(genericAuthor);
// export const PublisherRoute = withRouter(publisher);
export const ProtectedAuthorRoute = withRouter(protectedAuthor);