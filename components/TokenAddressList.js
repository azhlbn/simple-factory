import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { ethers } from 'ethers';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Link,
  Button,
  Icon,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react';
import { FaPlus, FaExternalLinkAlt } from 'react-icons/fa';

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

  const tableBg = useColorModeValue('whiteAlpha.50', 'whiteAlpha.50');
  const headerBg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.100');
  const borderColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200');
  const hoverBg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.100');

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="brand.primary" thickness="4px" />
        <Text mt={4} color="gray.400">Loading Token Addresses...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="xl" variant="left-accent">
        <AlertIcon />
        <Box>
          <AlertTitle>Error Loading Token Addresses</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Box>
      </Alert>
    );
  }

  if (!data || !data.totemCreateds || data.totemCreateds.length === 0) {
    return (
      <Alert status="info" borderRadius="xl" variant="left-accent">
        <AlertIcon />
        <Box>
          <AlertTitle>No Tokens Found</AlertTitle>
          <AlertDescription>No totem tokens have been created yet.</AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box
      overflowX="auto"
      bg={tableBg}
      borderRadius="2xl"
      border="1px solid"
      borderColor={borderColor}
    >
      <Table variant="unstyled">
        <Thead>
          <Tr bg={headerBg}>
            <Th color="gray.300" py={4} px={6} borderBottom="1px solid" borderColor={borderColor}>Totem ID</Th>
            <Th color="gray.300" py={4} px={6} borderBottom="1px solid" borderColor={borderColor}>Token Address</Th>
            <Th color="gray.300" py={4} px={6} borderBottom="1px solid" borderColor={borderColor}>Creator</Th>
            <Th color="gray.300" py={4} px={6} borderBottom="1px solid" borderColor={borderColor}>Actions</Th>
          </Tr>
        </Thead>

        <Tbody>
          {data.totemCreateds.map((item) => {
            const tokenInfo = tokenNames[item.totemTokenAddr] || { name: 'Loading...', symbol: '...' };
            return (
              <Tr
                key={item.id}
                _hover={{ bg: hoverBg }}
                transition="background-color 0.2s"
              >
                <Td color="gray.300" py={4} px={6} borderBottom="1px solid" borderColor={borderColor}>
                  {item.totemId}
                </Td>
                <Td py={4} px={6} borderBottom="1px solid" borderColor={borderColor}>
                  <Link
                    href={`https://soneium-minato.blockscout.com/address/${item.totemTokenAddr}`}
                    isExternal
                    color="brand.primary"
                    display="block"
                    mb={1}
                  >
                    {tokenInfo.name} ({tokenInfo.symbol}) <Icon as={FaExternalLinkAlt} boxSize={3} mx={1} />
                  </Link>
                  <Text fontSize="sm" color="gray.500">
                    {item.totemTokenAddr.substring(0, 8)}...{item.totemTokenAddr.substring(item.totemTokenAddr.length - 6)}
                  </Text>
                </Td>
                <Td py={4} px={6} borderBottom="1px solid" borderColor={borderColor}>
                  <Link
                    href={`https://soneium-minato.blockscout.com/address/${item.totemAddr}`}
                    isExternal
                    color="brand.primary"
                  >
                    {item.totemAddr.substring(0, 8)}...{item.totemAddr.substring(item.totemAddr.length - 6)}
                    <Icon as={FaExternalLinkAlt} boxSize={3} mx={1} />
                  </Link>
                </Td>
                <Td py={4} px={6} borderBottom="1px solid" borderColor={borderColor}>
                  <Button
                    leftIcon={<Icon as={FaPlus} />}
                    onClick={() => addTokenToMetaMask(item.totemTokenAddr, tokenInfo.symbol)}
                    variant="primary"
                    size="sm"
                  >
                    Add to MetaMask
                  </Button>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TokenAddressList;
