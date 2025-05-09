import React, { useState, useEffect } from 'react';
import { Card, Image, Button, Icon, Loader, Message, Segment } from 'semantic-ui-react';
import { ethers } from 'ethers';
import { useQuery, gql } from '@apollo/client';
import { TOTEM_FACTORY_ADDRESS, TOTEM_FACTORY_ABI, TOTEM_ABI, TOTEM_TOKEN_ABI } from '../pages/totemConfig';

// GraphQL запрос для получения списка тотемов
const GET_TOTEMS = gql`
  query GetTotems {
    totemCreateds(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
      id
      totemAddr
      totemTokenAddr
      totemId
      blockTimestamp
    }
  }
`;

const TotemList = ({ provider }) => {
  const [totems, setTotems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Запрос к The Graph для получения списка тотемов
  const { loading: queryLoading, error: queryError, data } = useQuery(GET_TOTEMS);

  // Получение метаданных тотема с IPFS
  const fetchTotemMetadata = async (totemAddress, tokenAddress) => {
    try {
      // Получаем данные тотема
      const totemContract = new ethers.Contract(
        totemAddress,
        TOTEM_ABI,
        provider
      );
      
      // Получаем данные токена
      const tokenContract = new ethers.Contract(
        tokenAddress,
        TOTEM_TOKEN_ABI,
        provider
      );
      
      // Получаем dataHash и информацию о токене
      const [dataHashBytes, name, symbol] = await Promise.all([
        totemContract.dataHash(),
        tokenContract.name(),
        tokenContract.symbol()
      ]);
      
      // Преобразуем байты в строку
      const dataHashString = ethers.utils.toUtf8String(dataHashBytes);
      
      // Преобразуем IPFS URI в HTTP URL для запроса
      const ipfsHash = dataHashString.replace('ipfs://', '');
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      
      // Получаем метаданные
      const response = await fetch(url);
      const metadata = await response.json();
      
      return {
        metadata,
        name,
        symbol
      };
    } catch (err) {
      console.error('Error fetching totem metadata:', err);
      return {
        metadata: null,
        name: 'Unknown',
        symbol: 'UNK'
      };
    }
  };

  // Загрузка данных о тотемах
  useEffect(() => {
    const loadTotemData = async () => {
      if (!data || !data.totemCreateds) return;
      
      setLoading(true);
      setError('');
      
      try {
        // Получаем данные для каждого тотема
        const totemsWithMetadata = await Promise.all(
          data.totemCreateds.map(async (totem) => {
            const { metadata, name, symbol } = await fetchTotemMetadata(totem.totemAddr, totem.totemTokenAddr);
            
            return {
              ...totem,
              metadata,
              name,
              symbol,
              imageUrl: metadata && metadata.image ? `https://gateway.pinata.cloud/ipfs/${metadata.image.replace('ipfs://', '')}` : null,
              description: metadata ? metadata.description : ''
            };
          })
        );
        
        setTotems(totemsWithMetadata);
      } catch (err) {
        console.error('Error loading totem data:', err);
        setError('Failed to load totem data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadTotemData();
  }, [data, provider]);

  if (queryLoading || loading) {
    return (
      <Segment>
        <Loader active>Loading Totems...</Loader>
      </Segment>
    );
  }

  if (queryError || error) {
    return (
      <Message negative>
        <Message.Header>Error Loading Totems</Message.Header>
        <p>{queryError?.message || error}</p>
      </Message>
    );
  }

  if (totems.length === 0) {
    return (
      <Message info>
        <Message.Header>No Totems Found</Message.Header>
        <p>No totems have been created yet. Be the first to create a totem!</p>
      </Message>
    );
  }

  return (
    <Card.Group stackable itemsPerRow={3}>
      {totems.map((totem) => (
        <Card key={totem.id}>
          {totem.imageUrl ? (
            <Image src={totem.imageUrl} wrapped ui={false} />
          ) : (
            <div style={{ height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="image" size="huge" color="grey" />
            </div>
          )}
          <Card.Content>
            <Card.Header>{totem.name}</Card.Header>
            <Card.Meta>
              <span>ID: {totem.totemId}</span>
            </Card.Meta>
            <Card.Description>
              {totem.description || 'No description available'}
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Button 
              basic 
              color="blue" 
              fluid
              as="a"
              href={`https://etherscan.io/address/${totem.totemAddr}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="external" /> View on Etherscan
            </Button>
          </Card.Content>
        </Card>
      ))}
    </Card.Group>
  );
};

export default TotemList;
