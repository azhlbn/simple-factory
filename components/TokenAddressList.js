import React, { useState, useEffect } from 'react';
import { Table, Icon, Message, Segment, Loader, Button } from 'semantic-ui-react';
import { useQuery, gql } from '@apollo/client';
import { ethers } from 'ethers';

// GraphQL запрос для получения списка токенов
const GET_TOKEN_ADDRESSES = gql`
  query GetTokenAddresses {
    totemCreateds(first: 20, orderBy: blockTimestamp, orderDirection: desc) {
      id
      totemAddr
      totemTokenAddr
      totemId
    }
  }
`;

const TokenAddressList = ({ provider }) => {
  const [userAddress, setUserAddress] = useState('');
  
  // Запрос к The Graph для получения списка токенов
  const { loading, error, data } = useQuery(GET_TOKEN_ADDRESSES);

  useEffect(() => {
    const getUserAddress = async () => {
      if (provider) {
        try {
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
        } catch (err) {
          console.error('Error getting user address:', err);
        }
      }
    };

    getUserAddress();
  }, [provider]);
  
  // Загрузка информации о токенах
  const [tokenNames, setTokenNames] = useState({});
  
  useEffect(() => {
    const loadTokenNames = async () => {
      if (!data || !data.totemCreateds) return;
      
      const tokenNamesMap = {};
      
      for (const item of data.totemCreateds) {
        try {
          const tokenContract = new ethers.Contract(
            item.totemTokenAddr,
            [
              "function name() view returns (string)",
              "function symbol() view returns (string)"
            ],
            provider
          );
          
          const [name, symbol] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol()
          ]);
          
          tokenNamesMap[item.totemTokenAddr] = { name, symbol };
        } catch (err) {
          console.error(`Error loading token info for ${item.totemTokenAddr}:`, err);
          tokenNamesMap[item.totemTokenAddr] = { name: 'Unknown', symbol: 'UNK' };
        }
      }
      
      setTokenNames(tokenNamesMap);
    };
    
    if (provider && data) {
      loadTokenNames();
    }
  }, [provider, data]);

  // Функция для добавления токена в MetaMask
  const addTokenToMetaMask = async (tokenAddress, tokenSymbol) => {
    try {
      // Запрос на добавление токена в MetaMask
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: 18,
          },
        },
      });
    } catch (err) {
      console.error('Error adding token to MetaMask:', err);
    }
  };

  if (loading) {
    return (
      <Segment>
        <Loader active>Loading Token Addresses...</Loader>
      </Segment>
    );
  }

  if (error) {
    return (
      <Message negative>
        <Message.Header>Error Loading Token Addresses</Message.Header>
        <p>{error.message}</p>
      </Message>
    );
  }

  if (!data || !data.totemCreateds || data.totemCreateds.length === 0) {
    return (
      <Message info>
        <Message.Header>No Tokens Found</Message.Header>
        <p>No totem tokens have been created yet.</p>
      </Message>
    );
  }

  return (
    <Segment>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Totem ID</Table.HeaderCell>
            <Table.HeaderCell>Token Address</Table.HeaderCell>
            <Table.HeaderCell>Creator</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data.totemCreateds.map((item) => {
            const tokenInfo = tokenNames[item.totemTokenAddr] || { name: 'Loading...', symbol: '...' };
            return (
            <Table.Row key={item.id}>
              <Table.Cell>{item.totemId}</Table.Cell>
              <Table.Cell>
                <a
                  href={`https://etherscan.io/address/${item.totemTokenAddr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tokenInfo.name} ({tokenInfo.symbol})
                </a>
                <div style={{ fontSize: '0.8em', color: '#888' }}>
                  {item.totemTokenAddr.substring(0, 8)}...{item.totemTokenAddr.substring(item.totemTokenAddr.length - 6)}
                </div>
              </Table.Cell>
              <Table.Cell>
                <a
                  href={`https://etherscan.io/address/${item.totemAddr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.totemAddr.substring(0, 8)}...{item.totemAddr.substring(item.totemAddr.length - 6)}
                </a>
              </Table.Cell>
              <Table.Cell>
                <Button
                  size="tiny"
                  color="orange"
                  onClick={() => addTokenToMetaMask(item.totemTokenAddr, tokenInfo.symbol)}
                >
                  <Icon name="plus" /> Add to MetaMask
                </Button>
              </Table.Cell>
            </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </Segment>
  );
};

export default TokenAddressList;
