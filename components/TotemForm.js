import React, { useState, useRef } from 'react';
import { Button, Form, Icon, Input, Message, Segment } from 'semantic-ui-react';
import { ethers } from 'ethers';
import { uploadTotemToIPFS, unpinFromIPFS } from '../utils/api';
import { TOTEM_FACTORY_ADDRESS, TOTEM_FACTORY_ABI } from '../config/totem';

const TotemForm = ({ provider }) => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    collaborators: ''
  });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleInputChange = (e, { name, value }) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const createTotem = async () => {
    const { name, symbol, description, collaborators } = formData;

    // Валидация формы
    if (!name || !symbol || !file) {
      setError('Please fill in all required fields and upload an image');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setTxHash('');

    // Сохраняем CID для возможного открепления
    let metadataCid = '';
    let imageCid = '';

    try {
      // 1. Сначала загружаем изображение и метаданные на IPFS
      const metadata = {
        name: formData.name,
        description: formData.description,
        symbol: formData.symbol,
        attributes: [
          {
            trait_type: "Type",
            value: "Totem"
          }
        ]
      };
      
      const ipfsResult = await uploadTotemToIPFS(file, metadata);
      
      if (!ipfsResult.success) {
        throw new Error(ipfsResult.error || 'Failed to upload to IPFS');
      }
      
      // Сохраняем CID для возможного открепления
      metadataCid = ipfsResult.cid;
      imageCid = ipfsResult.imageCid;
      
      // 2. Получаем signer для транзакций
      const signer = provider.getSigner();
      
      // 3. Создаем экземпляр контракта
      const totemFactory = new ethers.Contract(
        TOTEM_FACTORY_ADDRESS,
        TOTEM_FACTORY_ABI,
        signer
      );

      // 4. Преобразуем IPFS хеш метаданных в байты для dataHash
      const dataHash = ethers.utils.toUtf8Bytes(`ipfs://${metadataCid}`);
      
      // 5. Разбиваем строку с адресами коллабораторов на массив
      const collaboratorsArray = collaborators
        ? collaborators.split(',').map(addr => addr.trim()).filter(addr => ethers.utils.isAddress(addr))
        : [];
      
      // 6. Вызываем метод createTotem в смарт-контракте
      try {
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
          description: '',
          collaborators: ''
        });
        setFile(null);
        setFileName('');
      } catch (txError) {
        // Если транзакция отменена или не удалась, открепляем файлы с IPFS
        console.log('Transaction failed or was rejected. Unpinning files from IPFS...');
        
        // Открепляем метаданные
        if (metadataCid) {
          await unpinFromIPFS(metadataCid);
        }
        
        // Открепляем изображение
        if (imageCid) {
          await unpinFromIPFS(imageCid);
        }
        
        throw txError; // Перебрасываем ошибку дальше
      }
    } catch (err) {
      console.error('Error creating totem:', err);
      setError(err.message || 'Failed to create totem. Please try again.');
      
      // Если ошибка произошла до вызова транзакции, тоже открепляем файлы
      if (metadataCid && !success) {
        await unpinFromIPFS(metadataCid).catch(e => console.error('Error unpinning metadata:', e));
      }
      
      if (imageCid && !success) {
        await unpinFromIPFS(imageCid).catch(e => console.error('Error unpinning image:', e));
      }
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
          <label>Description</label>
          <Input
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter totem description"
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
        
        <Form.Field>
          <label>Upload Image</label>
          <div
            style={{
              border: '2px dashed #ccc',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '20px',
              cursor: 'pointer',
              borderRadius: '5px',
            }}
            onClick={() => document.getElementById('file-input').click()}
          >
            <Icon name="file image outline" size="huge" />
            <p>Drag and drop an image here or click to select</p>
            <input
              id="file-input"
              type="file"
              hidden
              onChange={(e) => handleFileChange(e.target.files[0])}
              accept="image/*"
            />
          </div>
          {fileName && (
            <Message info>
              <p>
                <Icon name="file" /> {fileName}
              </p>
            </Message>
          )}
        </Form.Field>
        
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
          disabled={loading || !formData.name || !formData.symbol || !file}
          loading={loading}
        >
          <Icon name="magic" /> Create Totem
        </Button>
      </Form>
    </Segment>
  );
};

export default TotemForm;
