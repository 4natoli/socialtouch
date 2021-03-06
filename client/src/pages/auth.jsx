import React from 'react';

const Auth = ({ children }) => {
  return (
    <div className="content__login">
      <div className="login-el logo">
        <span className="social">social</span>
        <span className="touch">Touch</span>
      </div>
      <div className="block">{children}</div>
    </div>
  );
};

export default Auth;
