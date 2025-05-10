import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Button,
  Input,
  Image,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Heading,
  Link,
  Icon,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  Badge,
  SimpleGrid,
  Spinner,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import { FaUser, FaExternalLinkAlt, FaFile, FaSearch } from 'react-icons/fa';
import { TOTEM_ABI, TOTEM_TOKEN_ABI } from '../config/totem';

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

  const cardBg = useColorModeValue('gray.800', 'gray.800');
  const borderColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200');
  const badgeBg = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200');

  return (
    <VStack spacing={6} width="100%">
      <Box width="100%">
        <InputGroup size="lg">
          <Input
            value={totemAddress}
            onChange={(e) => handleInputChange(e)}
            placeholder="Enter totem address (0x...)"
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            _hover={{ borderColor: 'brand.primary' }}
            _focus={{ borderColor: 'brand.primary', boxShadow: 'none' }}
            height="56px"
            fontSize="lg"
          />
          <InputRightElement width="auto" pr={1}>
            <Button
              leftIcon={<Icon as={FaSearch} />}
              onClick={fetchTotemData}
              isDisabled={loading || !totemAddress}
              isLoading={loading}
              variant="primary"
              size="md"
              height="48px"
              mr={1}
            >
              View Totem
            </Button>
          </InputRightElement>
        </InputGroup>
      </Box>

      {error && (
        <Alert status="error" borderRadius="xl" variant="left-accent">
          <AlertIcon />
          <Box>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      )}

      {loading && (
        <Box py={10} textAlign="center">
          <Spinner size="xl" color="brand.primary" thickness="4px" />
          <Text mt={4} color="gray.400">Loading Totem Data...</Text>
        </Box>
      )}

      {totemData && (
        <Box
          width="100%"
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
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
          <VStack spacing={6} p={8}>
            <VStack spacing={2} width="100%" align="start">
              <Heading size="lg" color="white">
                {totemData.name} <Badge ml={2} bg={badgeBg} color="gray.300">{totemData.symbol}</Badge>
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Token Address: {totemData.tokenAddress.substring(0, 8)}...{totemData.tokenAddress.substring(totemData.tokenAddress.length - 6)}
              </Text>
            </VStack>

            {totemData.imageUrl && (
              <Box
                width="100%"
                borderRadius="xl"
                overflow="hidden"
                position="relative"
                aspectRatio={1}
              >
                <Image
                  src={totemData.imageUrl}
                  alt={totemData.name}
                  objectFit="cover"
                  width="100%"
                  height="100%"
                />
              </Box>
            )}

            <VStack spacing={6} width="100%" align="start">
              <Box>
                <Heading size="md" color="gray.300" mb={2}>Description</Heading>
                <Text color="gray.400">
                  {totemData.metadata.description || 'No description available'}
                </Text>
              </Box>

              <Box width="100%">
                <Heading size="md" color="gray.300" mb={4}>Collaborators</Heading>
                {totemData.collaborators.length > 0 ? (
                  <List spacing={3}>
                    {totemData.collaborators.map((address, index) => (
                      <ListItem key={index} color="gray.400">
                        <ListIcon as={FaUser} color="brand.primary" />
                        <Link
                          href={`https://soneium-minato.blockscout.com/address/${address}`}
                          isExternal
                          color="brand.primary"
                        >
                          {address.substring(0, 8)}...{address.substring(address.length - 6)}
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text color="gray.500">No collaborators</Text>
                )}
              </Box>

              {totemData.metadata.attributes && (
                <Box width="100%">
                  <Heading size="md" color="gray.300" mb={4}>Attributes</Heading>
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                    {totemData.metadata.attributes.map((attr, index) => (
                      <Box
                        key={index}
                        bg="whiteAlpha.100"
                        p={4}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                      >
                        <Text color="gray.400" fontSize="sm" fontWeight="bold" mb={1}>
                          {attr.trait_type}
                        </Text>
                        <Text color="white">{attr.value}</Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}

              <HStack spacing={4} width="100%">
                <Button
                  leftIcon={<Icon as={FaExternalLinkAlt} />}
                  as="a"
                  href={`https://soneium-minato.blockscout.com/address/${totemData.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="md"
                  flex={1}
                >
                  View on Blockscout
                </Button>
                <Button
                  leftIcon={<Icon as={FaFile} />}
                  as="a"
                  href={`https://gateway.pinata.cloud/ipfs/${totemData.dataHash.replace('ipfs://', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="md"
                  flex={1}
                >
                  View Metadata
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

export default TotemViewer;
