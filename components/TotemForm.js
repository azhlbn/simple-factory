import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link,
  Icon,
  useColorModeValue,
  Center,
  Textarea
} from '@chakra-ui/react';
import { FaMagic, FaImage, FaFile } from 'react-icons/fa';
import { uploadTotemToIPFS, unpinFromIPFS } from '../utils/api';
import { TOTEM_FACTORY_ADDRESS, TOTEM_FACTORY_ABI } from '../config/totem';

const TotemForm = ({ provider, onSuccess }) => {
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
        // Проверяем события в транзакции
        let totemAddress = '';
        if (receipt.events) {
          // В некоторых случаях события могут иметь другую структуру
          // Пробуем найти событие по имени
          const totemCreatedEvent = receipt.events.find(event => event && event.name === 'TotemCreated');
          
          if (totemCreatedEvent && totemCreatedEvent.args) {
            totemAddress = totemCreatedEvent.args.totemAddr;
          } else {
            // Альтернативный способ: ищем событие по сигнатуре или индексу
            // Обычно первое событие в массиве - это то, что нам нужно
            if (receipt.events.length > 0 && receipt.events[0].args) {
              totemAddress = receipt.events[0].args.totemAddr || '';
            }
          }
        }
        
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
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
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

  const cardBg = useColorModeValue('gray.800', 'gray.800');
  const borderColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200');
  const dropzoneBg = useColorModeValue('whiteAlpha.50', 'whiteAlpha.50');
  const dropzoneBorderColor = useColorModeValue('whiteAlpha.300', 'whiteAlpha.300');
  const dropzoneHoverBg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.100');

  return (
    <Box
      bg={cardBg}
      borderRadius="2xl"
      border="1px solid"
      borderColor={borderColor}
      p={8}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: -1,
        margin: '-1px',
        borderRadius: 'inherit',
        background: 'linear-gradient(45deg, rgba(74, 222, 128, 0.1), rgba(74, 222, 128, 0))',
      }}
    >
      <VStack spacing={6} align="stretch">
        <FormControl isRequired>
          <FormLabel color="gray.300">Totem Name</FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={(e) => handleInputChange(e, { name: e.target.name, value: e.target.value })}
            placeholder="Enter totem name"
            size="md"
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            _hover={{ borderColor: 'brand.primary' }}
            _focus={{ borderColor: 'brand.primary', boxShadow: 'none' }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel color="gray.300">Totem Symbol</FormLabel>
          <Input
            name="symbol"
            value={formData.symbol}
            onChange={(e) => handleInputChange(e, { name: e.target.name, value: e.target.value })}
            placeholder="Enter token symbol (e.g. BTC, ETH)"
            size="md"
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            _hover={{ borderColor: 'brand.primary' }}
            _focus={{ borderColor: 'brand.primary', boxShadow: 'none' }}
          />
        </FormControl>

        <FormControl>
          <FormLabel color="gray.300">Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={(e) => handleInputChange(e, { name: e.target.name, value: e.target.value })}
            placeholder="Enter totem description"
            size="md"
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            _hover={{ borderColor: 'brand.primary' }}
            _focus={{ borderColor: 'brand.primary', boxShadow: 'none' }}
            minH="120px"
          />
        </FormControl>

        <FormControl>
          <FormLabel color="gray.300">Collaborators (optional)</FormLabel>
          <Input
            name="collaborators"
            value={formData.collaborators}
            onChange={(e) => handleInputChange(e, { name: e.target.name, value: e.target.value })}
            placeholder="0x1234...,0xabcd..."
            size="md"
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            _hover={{ borderColor: 'brand.primary' }}
            _focus={{ borderColor: 'brand.primary', boxShadow: 'none' }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel color="gray.300">Upload Image</FormLabel>
          <Box
            bg={dropzoneBg}
            border="2px dashed"
            borderColor={dropzoneBorderColor}
            borderRadius="xl"
            p={8}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: dropzoneHoverBg }}
            onClick={() => document.getElementById('file-input').click()}
          >
            <Center flexDirection="column" color="gray.400">
              <Icon as={FaImage} boxSize={12} mb={4} />
              <Text>Drag and drop an image here or click to select</Text>
            </Center>
            <input
              id="file-input"
              type="file"
              hidden
              onChange={(e) => handleFileChange(e.target.files[0])}
              accept="image/*"
            />
          </Box>
          {fileName && (
            <Alert status="info" mt={4} borderRadius="xl" variant="left-accent">
              <AlertIcon as={FaFile} />
              <Text>{fileName}</Text>
            </Alert>
          )}
        </FormControl>

        {error && (
          <Alert status="error" borderRadius="xl" variant="left-accent">
            <AlertIcon />
            <Box>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        )}

        {success && (
          <Alert status="success" borderRadius="xl" variant="left-accent">
            <AlertIcon />
            <Box>
              <AlertTitle>Totem Created Successfully!</AlertTitle>
              <AlertDescription>
                Your totem has been created. Transaction hash:{' '}
                <Link
                  href={`https://soneium-minato.blockscout.com/tx/${txHash}`}
                  isExternal
                  color="brand.primary"
                  textDecoration="underline"
                >
                  {txHash.substring(0, 10)}...
                </Link>
              </AlertDescription>
            </Box>
          </Alert>
        )}

        <Button
          leftIcon={<Icon as={FaMagic} />}
          onClick={createTotem}
          isDisabled={loading || !formData.name || !formData.symbol || !file}
          isLoading={loading}
          variant="primary"
          size="sm"
          height="40px"
          px={4}
          fontWeight="bold"
        >
          Create Totem
        </Button>
      </VStack>
    </Box>
  );
};

export default TotemForm;
