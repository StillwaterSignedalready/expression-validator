import React from 'react';
import logo from './logo.svg';
import ExpValidator from './ExpValidator'
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <ExpValidator />
      </header>
    </div>
  );
}

export default App;
