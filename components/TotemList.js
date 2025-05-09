import React, { useState, useEffect } from 'react';
import { Card, Image, Button, Icon, Loader, Message, Segment } from 'semantic-ui-react';
import { ethers } from 'ethers';
import { TOTEM_ABI, TOTEM_TOKEN_ABI } from '../pages/totemConfig';
import { fetchTotemsWithMetadata } from '../utils/graphApi';

const TotemList = ({ provider }) => {
  const [totems, setTotems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Состояние для отслеживания загрузки данных из The Graph
  const [queryLoading, setQueryLoading] = useState(true);
  const [queryError, setQueryError] = useState(null);

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
      setQueryLoading(true);
      setLoading(true);
      setError('');
      
      try {
        // Получаем тотемы с метаданными с помощью новой функции
        const totemsData = await fetchTotemsWithMetadata();
        
        // Если нет данных, просто устанавливаем пустой массив и завершаем загрузку
        if (!totemsData || totemsData.length === 0) {
          setTotems([]);
          setQueryLoading(false);
          setLoading(false);
          return;
        }
        
        // Дополняем данные информацией о токенах
        const enhancedTotems = await Promise.all(
          totemsData.map(async (totem) => {
            try {
              // Получаем данные токена
              const tokenContract = new ethers.Contract(
                totem.tokenAddress,
                TOTEM_TOKEN_ABI,
                provider
              );
              
              // Получаем имя и символ токена
              const [name, symbol] = await Promise.all([
                tokenContract.name(),
                tokenContract.symbol()
              ]);
              
              // Формируем URL изображения
              const imageUrl = totem.metadata && totem.metadata.image 
                ? `https://gateway.pinata.cloud/ipfs/${totem.metadata.image.replace('ipfs://', '')}` 
                : null;
              
              return {
                id: totem.id,
                totemAddr: totem.totemAddress,
                totemTokenAddr: totem.tokenAddress,
                metadata: totem.metadata,
                name,
                symbol,
                imageUrl,
                description: totem.metadata ? totem.metadata.description : '',
                createdAt: new Date(parseInt(totem.createdAt) * 1000).toLocaleDateString()
              };
            } catch (err) {
              console.error(`Error enhancing totem ${totem.id}:`, err);
              return {
                id: totem.id,
                totemAddr: totem.totemAddress,
                totemTokenAddr: totem.tokenAddress,
                metadata: totem.metadata,
                name: 'Unknown',
                symbol: 'UNK',
                imageUrl: null,
                description: totem.metadata ? totem.metadata.description : '',
                createdAt: new Date(parseInt(totem.createdAt) * 1000).toLocaleDateString()
              };
            }
          })
        );
        
        setTotems(enhancedTotems);
        setQueryLoading(false);
      } catch (err) {
        console.error('Error loading totem data:', err);
        setError('Failed to load totem data. Please try again.');
        setQueryError(err);
        setQueryLoading(false);
      } finally {
        setLoading(false);
      }
    };
    
    loadTotemData();
  }, [provider]);

  if (queryLoading || loading) {
    return (
      <Segment>
        <Loader active>Loading Totems...</Loader>
      </Segment>
    );
  }

  if (queryError || error) {
    console.log('Error details:', queryError || error);
    return (
      <Message negative>
        <Message.Header>Error Loading Totems</Message.Header>
        <p>Could not load totems. The Graph API might not be configured properly.</p>
        <Button onClick={() => window.location.reload()} primary>
          <Icon name="refresh" /> Try Again
        </Button>
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
