import React, { useState } from "react";
import { ethers } from "ethers";
import { ApolloProvider } from '@apollo/client';
import {
  Container,
  Box,
  Heading,
  VStack,
  Alert,
  AlertIcon,
  useColorModeValue,
  Text,
  Divider
} from '@chakra-ui/react';
import Navbar from "../components/Navbar";
import TotemViewer from "../components/TotemViewer";
import TotemList from "../components/TotemList";
import TokenAddressList from "../components/TokenAddressList";
import apolloClient from "../lib/apollo-client";



const Index = () => {
    const [provider, setProvider] = useState(null);

    const handleConnect = (newProvider) => {
        setProvider(newProvider);
    };

    const bgColor = useColorModeValue('gray.900', 'gray.800');
    const borderColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200');
    const textColor = useColorModeValue('gray.100', 'gray.100');
    const dividerColor = useColorModeValue('whiteAlpha.300', 'whiteAlpha.300');

    return (
        <ApolloProvider client={apolloClient}>
            <Box minH="100vh" bg="#0B0E1A">
                <Navbar provider={provider} onConnect={handleConnect} />
                <Container maxW="7xl" pt={28} pb={10}>
                    <VStack spacing={12} align="stretch">
                        <Box width="100%" textAlign="center" mb={6}>
                            <Heading
                                as="h1"
                                size="2xl"
                                textAlign="center"
                                mb={4}
                                bgGradient="linear(to-r, brand.primary, brand.accent)"
                                bgClip="text"
                                letterSpacing="tight"
                            >
                                Totem Factory
                            </Heading>
                            <Text color="gray.400" maxW="2xl" mx="auto" fontSize="lg">
                                Create and manage unique tokens with metadata stored on IPFS
                            </Text>
                        </Box>

                        {provider ? (
                            <Box>
                                <Box 
                                    mb={10} 
                                    borderRadius="xl" 
                                    overflow="hidden" 
                                    bg="rgba(17, 24, 39, 0.4)" 
                                    border="1px solid" 
                                    borderColor="whiteAlpha.100"
                                    boxShadow="0 4px 20px rgba(0, 0, 0, 0.2)"
                                    backdropFilter="blur(10px)"
                                >
                                    <Box 
                                        py={4} 
                                        px={6} 
                                        borderBottom="1px solid" 
                                        borderColor="whiteAlpha.100"
                                        bg="rgba(17, 24, 39, 0.6)"
                                    >
                                        <Heading
                                            as="h2"
                                            size="md"
                                            color="white"
                                            fontWeight="semibold"
                                        >
                                            Totems
                                        </Heading>
                                    </Box>
                                    <Box p={6}>
                                        <TotemList provider={provider} />
                                    </Box>
                                </Box>

                                <Box 
                                    borderRadius="xl" 
                                    overflow="hidden" 
                                    bg="rgba(17, 24, 39, 0.4)" 
                                    border="1px solid" 
                                    borderColor="whiteAlpha.100"
                                    boxShadow="0 4px 20px rgba(0, 0, 0, 0.2)"
                                    backdropFilter="blur(10px)"
                                >
                                    <Box 
                                        py={4} 
                                        px={6} 
                                        borderBottom="1px solid" 
                                        borderColor="whiteAlpha.100"
                                        bg="rgba(17, 24, 39, 0.6)"
                                    >
                                        <Heading
                                            as="h2"
                                            size="md"
                                            color="white"
                                            fontWeight="semibold"
                                        >
                                            Token Addresses
                                        </Heading>
                                    </Box>
                                    <Box p={6}>
                                        <TokenAddressList provider={provider} />
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            <Box 
                                borderRadius="xl" 
                                p={8} 
                                bg="rgba(17, 24, 39, 0.4)" 
                                border="1px solid" 
                                borderColor="whiteAlpha.100"
                                textAlign="center"
                                boxShadow="0 4px 20px rgba(0, 0, 0, 0.2)"
                                backdropFilter="blur(10px)"
                            >
                                <Alert 
                                    status="warning" 
                                    borderRadius="xl" 
                                    bg="rgba(250, 173, 20, 0.1)"
                                    borderColor="yellow.400"
                                    border="1px solid"
                                >
                                    <AlertIcon />
                                    Please connect your MetaMask wallet to use the application.
                                </Alert>
                            </Box>
                        )}
                    </VStack>
                </Container>
            </Box>
        </ApolloProvider>
    );
};

export default Index;
