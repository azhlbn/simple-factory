import React, { useState } from 'react';
import { Form, Button, Input, Card, Image, Segment, Message, Icon, Loader, List } from 'semantic-ui-react';
import { ethers } from 'ethers';
import { TOTEM_ABI, TOTEM_TOKEN_ABI } from '../pages/totemConfig';

const TotemViewer = ({ provider }) => {
  const [totemAddress, setTotemAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totemData, setTotemData] = useState(null);

  const handleInputChange = (e) => {
    setTotemAddress(e.target.value);
  };

  const fetchTotemData = async () => {
    if (!ethers.utils.isAddress(totemAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    setLoading(true);
    setError('');
    setTotemData(null);

    try {
      // Создаем экземпляр контракта тотема
      const totemContract = new ethers.Contract(
        totemAddress,
        TOTEM_ABI,
        provider
      );

      // Получаем базовую информацию о тотеме
      const dataHashBytes = await totemContract.dataHash();
      const totemTokenAddr = await totemContract.totemTokenAddr();
      
      // Преобразуем байты в строку
      const dataHashString = ethers.utils.toUtf8String(dataHashBytes);
      const ipfsHash = dataHashString.replace('ipfs://', '');
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      
      // Получаем информацию о токене
      const tokenContract = new ethers.Contract(
        totemTokenAddr,
        TOTEM_TOKEN_ABI,
        provider
      );
      
      const [name, symbol] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol()
      ]);
      
      // Получаем список коллабораторов
      let collaborators = [];
      try {
        let index = 0;
        while (true) {
          const collaborator = await totemContract.collaborators(index);
          collaborators.push(collaborator);
          index++;
        }
      } catch (err) {
        // Достигнут конец массива коллабораторов
      }
      
      const response = await fetch(url);
      const metadata = await response.json();

      // Формируем данные о тотеме
      setTotemData({
        address: totemAddress,
        name,
        symbol,
        tokenAddress: totemTokenAddr,
        dataHash: dataHashString,
        collaborators,
        metadata,
        imageUrl: metadata.image ? `https://gateway.pinata.cloud/ipfs/${metadata.image.replace('ipfs://', '')}` : null
      });
    } catch (err) {
      console.error('Error fetching totem data:', err);
      setError('Failed to fetch totem data. Please check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Segment>
      <Form>
        <Form.Field>
          <label>Enter Totem Address</label>
          <Input
            value={totemAddress}
            onChange={handleInputChange}
            placeholder="0x..."
            action={
              <Button 
                primary 
                onClick={fetchTotemData} 
                disabled={loading || !totemAddress}
                loading={loading}
              >
                View Totem
              </Button>
            }
            fluid
          />
        </Form.Field>
      </Form>

      {error && (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}

      {loading && (
        <Segment basic textAlign="center">
          <Loader active>Loading Totem Data...</Loader>
        </Segment>
      )}

      {totemData && (
        <Card fluid>
          <Card.Content>
            <Card.Header>{totemData.name} ({totemData.symbol})</Card.Header>
            <Card.Meta>
              <span>Token Address: {totemData.tokenAddress.substring(0, 8)}...{totemData.tokenAddress.substring(totemData.tokenAddress.length - 6)}</span>
            </Card.Meta>
          </Card.Content>
          
          {totemData.imageUrl && (
            <Image src={totemData.imageUrl} wrapped ui={false} />
          )}
          
          <Card.Content>
            <Card.Description>
              <h4>Description:</h4>
              <p>{totemData.metadata.description || 'No description available'}</p>
              
              <h4>Collaborators:</h4>
              {totemData.collaborators.length > 0 ? (
                <List>
                  {totemData.collaborators.map((address, index) => (
                    <List.Item key={index}>
                      <Icon name="user" />
                      <List.Content>
                        <a 
                          href={`https://etherscan.io/address/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {address.substring(0, 8)}...{address.substring(address.length - 6)}
                        </a>
                      </List.Content>
                    </List.Item>
                  ))}
                </List>
              ) : (
                <p>No collaborators</p>
              )}
              
              {totemData.metadata.attributes && (
                <>
                  <h4>Attributes:</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {totemData.metadata.attributes.map((attr, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          background: '#f0f0f0', 
                          padding: '5px 10px', 
                          borderRadius: '5px',
                          color: '#333'
                        }}
                      >
                        <strong>{attr.trait_type}:</strong> {attr.value}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card.Description>
          </Card.Content>
          
          <Card.Content extra>
            <div className="ui two buttons">
              <Button 
                basic 
                color="blue"
                as="a"
                href={`https://etherscan.io/address/${totemData.address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="external" /> View on Etherscan
              </Button>
              <Button 
                basic 
                color="green"
                as="a"
                href={`https://gateway.pinata.cloud/ipfs/${totemData.dataHash.replace('ipfs://', '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="file" /> View Metadata
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}
    </Segment>
  );
};

export default TotemViewer;
