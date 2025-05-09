import React, { useState } from 'react';
import { Button, Form, Icon, Input, Message, Segment } from 'semantic-ui-react';
import { ethers } from 'ethers';
import FileUpload from './FileUpload';
import { TOTEM_FACTORY_ADDRESS, TOTEM_FACTORY_ABI } from '../pages/totemConfig';

const TotemForm = ({ provider }) => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    collaborators: '',
    ipfsHash: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleInputChange = (e, { name, value }) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUploaded = (ipfsHash) => {
    setFormData({ ...formData, ipfsHash });
  };

  const createTotem = async () => {
    const { name, symbol, ipfsHash, collaborators } = formData;

    // Валидация формы
    if (!name || !symbol || !ipfsHash) {
      setError('Please fill in all required fields and upload an image');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setTxHash('');

    try {
      // Получаем signer для транзакций
      const signer = provider.getSigner();
      
      // Создаем экземпляр контракта
      const totemFactory = new ethers.Contract(
        TOTEM_FACTORY_ADDRESS,
        TOTEM_FACTORY_ABI,
        signer
      );

      // Преобразуем IPFS хеш в байты для dataHash
      const dataHash = ethers.utils.toUtf8Bytes(`ipfs://${ipfsHash}`);
      
      // Разбиваем строку с адресами коллабораторов на массив
      const collaboratorsArray = collaborators
        ? collaborators.split(',').map(addr => addr.trim()).filter(addr => ethers.utils.isAddress(addr))
        : [];
      
      // Вызываем метод createTotem в смарт-контракте
      const tx = await totemFactory.createTotem(
        dataHash,
        name,
        symbol,
        collaboratorsArray
      );

      // Ждем подтверждения транзакции
      const receipt = await tx.wait();
      
      // Получаем адрес созданного тотема из события
      const totemCreatedEvent = receipt.events.find(event => event.name === 'TotemCreated');
      const totemAddress = totemCreatedEvent.args.totemAddr;
      
      setSuccess(true);
      setTxHash(receipt.transactionHash);
      
      // Сбрасываем форму
      setFormData({
        name: '',
        symbol: '',
        collaborators: '',
        ipfsHash: ''
      });
    } catch (err) {
      console.error('Error creating totem:', err);
      setError(err.message || 'Failed to create totem. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Segment>
      <Form>
        <Form.Field>
          <label>Totem Name</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter totem name"
            fluid
          />
        </Form.Field>
        
        <Form.Field>
          <label>Totem Symbol</label>
          <Input
            name="symbol"
            value={formData.symbol}
            onChange={handleInputChange}
            placeholder="Enter token symbol (e.g. BTC, ETH)"
            fluid
          />
        </Form.Field>
        
        <Form.Field>
          <label>Collaborators (optional, comma-separated addresses)</label>
          <Input
            name="collaborators"
            value={formData.collaborators}
            onChange={handleInputChange}
            placeholder="0x1234...,0xabcd..."
            fluid
          />
        </Form.Field>
        
        <FileUpload onFileUploaded={handleFileUploaded} />
        
        {error && (
          <Message negative>
            <Message.Header>Error</Message.Header>
            <p>{error}</p>
          </Message>
        )}
        
        {success && (
          <Message positive>
            <Message.Header>Totem Created Successfully!</Message.Header>
            <p>
              Your totem has been created. Transaction hash: 
              <a 
                href={`https://etherscan.io/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {txHash.substring(0, 10)}...
              </a>
            </p>
          </Message>
        )}
        
        <Button
          primary
          onClick={createTotem}
          disabled={loading || !formData.name || !formData.symbol || !formData.ipfsHash}
          loading={loading}
        >
          <Icon name="magic" /> Create Totem
        </Button>
      </Form>
    </Segment>
  );
};

export default TotemForm;
