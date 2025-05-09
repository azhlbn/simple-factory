import React, { useState, useEffect } from 'react';
import { Button, Icon, Message } from 'semantic-ui-react';
import { ethers } from 'ethers';

const WalletConnect = ({ onConnect }) => {
  const [account, setAccount] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Проверяем, подключен ли уже MetaMask
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            onConnect(provider);
          }
        } catch (err) {
          console.error('Error checking connection:', err);
        }
      }
    };

    checkConnection();
  }, [onConnect]);

  const connectWallet = async () => {
    setConnecting(true);
    setError('');

    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        onConnect(provider);
      } catch (err) {
        console.error('Error connecting to MetaMask:', err);
        setError('Error connecting to MetaMask. Please try again.');
      }
    } else {
      setError('MetaMask is not installed. Please install MetaMask to use this application.');
    }

    setConnecting(false);
  };

  return (
    <div>
      {error && (
        <Message negative>
          <Message.Header>Connection Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}

      {!account ? (
        <Button 
          color="orange" 
          fluid 
          size="large" 
          onClick={connectWallet} 
          loading={connecting}
          disabled={connecting}
        >
          <Icon name="ethereum" /> Connect MetaMask
        </Button>
      ) : (
        <Message positive>
          <Message.Header>Connected to MetaMask</Message.Header>
          <p>Account: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
        </Message>
      )}
    </div>
  );
};

export default WalletConnect;
