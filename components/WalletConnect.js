import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Button,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  useColorModeValue,
  Icon,
  Flex,
  Tooltip,
  Badge
} from '@chakra-ui/react';
import { FaEthereum, FaExchangeAlt, FaWallet, FaCheckCircle } from 'react-icons/fa';
import { checkMinatoNetwork, switchToMinato } from '../utils/network';

const WalletConnect = ({ onConnect }) => {
  const [account, setAccount] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [wrongNetwork, setWrongNetwork] = useState(false);

  useEffect(() => {
    // Проверяем, подключен ли уже MetaMask
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const isMinato = await checkMinatoNetwork(provider);
            if (isMinato) {
              setWrongNetwork(false);
              onConnect(provider);
            } else {
              setWrongNetwork(true);
            }
          }
        } catch (err) {
          console.error('Error checking connection:', err);
        }
      }
    };

    checkConnection();
  }, [onConnect]);

  const switchNetwork = async () => {
    setConnecting(true);
    setError('');

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const success = await switchToMinato(provider);
      if (success) {
        setWrongNetwork(false);
        onConnect(provider);
      } else {
        setError('Failed to switch to Minato network');
      }
    } catch (err) {
      console.error('Error switching network:', err);
      setError('Error switching network. Please try again.');
    }

    setConnecting(false);
  };

  const connectWallet = async () => {
    setConnecting(true);
    setError('');

    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const isMinato = await checkMinatoNetwork(provider);
        if (isMinato) {
          setWrongNetwork(false);
          onConnect(provider);
        } else {
          setWrongNetwork(true);
        }
      } catch (err) {
        console.error('Error connecting to MetaMask:', err);
        setError('Error connecting to MetaMask. Please try again.');
      }
    } else {
      setError('MetaMask is not installed. Please install MetaMask to use this application.');
    }

    setConnecting(false);
  };

  const buttonBg = useColorModeValue('brand.primary', 'brand.primary');
  const buttonHoverBg = useColorModeValue('brand.secondary', 'brand.secondary');

  return (
    <Box>
      {error && (
        <Alert status="error" variant="solid" borderRadius="full" mb={3} size="sm">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="xs">Connection Error</AlertTitle>
            <AlertDescription fontSize="xs">{error}</AlertDescription>
          </Box>
        </Alert>
      )}

      {wrongNetwork && account && (
        <Box 
          borderRadius="xl" 
          bg="rgba(250, 173, 20, 0.15)" 
          p={3} 
          border="1px solid" 
          borderColor="yellow.400"
          mb={3}
          position="relative"
          width="100%"
          zIndex="dropdown"
          boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
        >
          <VStack align="stretch" spacing={2}>
            <Flex align="center" gap={2}>
              <Icon as={FaExchangeAlt} color="yellow.400" />
              <Text fontWeight="bold" fontSize="sm" color="yellow.400">Wrong Network</Text>
            </Flex>
            <Text fontSize="xs" color="gray.300" mb={2}>
              Please switch to the Minato network.
            </Text>
            <Button
              leftIcon={<Icon as={FaExchangeAlt} />}
              onClick={switchNetwork}
              isLoading={connecting}
              isDisabled={connecting}
              variant="outline"
              size="sm"
              height="32px"
              px={4}
              fontSize="xs"
              fontWeight="bold"
            >
              Switch to Minato
            </Button>
          </VStack>
        </Box>
      )}

      {!account ? (
        <Button
          leftIcon={<Icon as={FaWallet} />}
          onClick={connectWallet}
          isLoading={connecting}
          isDisabled={connecting}
          size="md"
          variant="primary"
          height="38px"
          px={5}
        >
          Connect
        </Button>
      ) : (
        <Flex
          align="center"
          bg="whiteAlpha.100"
          borderRadius="full"
          px={4}
          py={2}
          border="1px solid"
          borderColor="brand.primary"
          boxShadow="0 0 10px rgba(16, 185, 129, 0.2)"
          _hover={{ 
            borderColor: "brand.accent", 
            boxShadow: "0 0 15px rgba(16, 185, 129, 0.3)" 
          }}
          transition="all 0.2s"
        >
          <Tooltip label="Connected to MetaMask" placement="top">
            <Flex align="center" gap={2}>
              <Icon as={FaCheckCircle} color="brand.primary" />
              <Text fontWeight="medium" fontSize="sm" color="white">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </Text>
            </Flex>
          </Tooltip>
          <Badge ml={2} bg="brand.primary" color="white" borderRadius="full" fontSize="2xs" px={2}>
            Minato
          </Badge>
        </Flex>
      )}
    </Box>
  );
};

export default WalletConnect;
