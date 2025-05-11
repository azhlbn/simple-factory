import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ethers } from 'ethers';
import { GET_ALL_TOTEMS } from '../utils/graphql';
import { TOTEM_FACTORY_ADDRESS } from '../config/totem';
import axios from 'axios';
import {
  Box,
  Grid,
  Text,
  Image,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Container,
  Heading,
  Stack,
  AspectRatio,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
  Badge,
  Link,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt } from 'react-icons/fa';

const TotemList = ({ provider }) => {
  const [totems, setTotems] = useState([]);
  const [selectedTotem, setSelectedTotem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedTotem, setExpandedTotem] = useState(null);

  // Получаем список тотемов из The Graph через Apollo
  const { data, loading: graphLoading, error: graphError } = useQuery(GET_ALL_TOTEMS, {
    variables: { first: 10, skip: 0 },
    skip: !provider,
    fetchPolicy: 'network-only', // Всегда получаем свежие данные с сервера
  });

  useEffect(() => {
    if (!provider || !data?.totemCreateds || graphLoading) return;
    let cancelled = false;

    const fetchMetadata = async () => {
      try {
        const factory = new ethers.Contract(
          TOTEM_FACTORY_ADDRESS,
          [
            'function totemDataByAddress(address) view returns (address creator, address totemTokenAddr, bytes dataHash)'
          ],
          provider
        );

        const enriched = await Promise.all(
          data.totemCreateds.map(async (totem) => {
            try {
              // Получаем dataHash из контракта
              const totemData = await factory.totemDataByAddress(totem.totemAddr);
              let dataHashString = '';
              if (totemData && totemData.dataHash) {
                try {
                  dataHashString = ethers.utils.toUtf8String(totemData.dataHash);
                } catch (e) {
                  // Иногда dataHash уже строка
                  dataHashString = totemData.dataHash;
                }
              }
              let metadata = null;
              if (dataHashString) {
                try {
                  // Убираем ipfs:// префикс, если он есть
                  const cleanHash = dataHashString.replace('ipfs://', '');
                  const url = `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
                  const resp = await axios.get(url);
                  metadata = resp.data;
                } catch (e) {
                  console.error(`Error fetching metadata:`, e.message);
                  metadata = null;
                }
              }
              return {
                ...totem,
                metadata
              };
            } catch (err) {
              console.error(`Error fetching metadata for totem ${totem.totemAddr}:`, err);
              return totem;
            }
          })
        );
        if (!cancelled) setTotems(enriched);
      } catch (err) {
        console.error('Error loading totem metadata:', err);
      }
    };
    fetchMetadata();
    return () => { cancelled = true; };
  }, [data, graphLoading, provider]);

  const cardBg = useColorModeValue('gray.800', 'gray.800');
  const cardBorderColor = useColorModeValue('whiteAlpha.100', 'whiteAlpha.100');
  const cardHoverBg = useColorModeValue('gray.700', 'gray.700');
  const textColor = useColorModeValue('white', 'white');
  const subTextColor = useColorModeValue('gray.400', 'gray.400');

  // Display loading state
  if (graphLoading) {
    return (
      <Container maxW="7xl" py={10}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="brand.primary" thickness="4px" />
          <Text mt={4} color="gray.400">Loading Totems...</Text>
        </Box>
      </Container>
    );
  }

  // Display error state
  if (graphError) {
    return (
      <Container maxW="7xl" py={10}>
        <Alert status="error" borderRadius="xl" variant="left-accent">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Error Loading Totems</Text>
            <Text>{graphError.message}</Text>
          </Box>
        </Alert>
      </Container>
    );
  }

  // Display empty state
  if (!totems || totems.length === 0) {
    return (
      <Container maxW="7xl" py={10}>
        <Alert status="info" borderRadius="xl" variant="left-accent">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">No Totems Found</Text>
            <Text>No totems have been created yet.</Text>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={10}>
      <Box>
        
        <Grid
          templateColumns={{
            base: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          }}
          gap={6}
        >
          {totems.map((totem) => (
            <Box
              key={totem.id}
              position="relative"
              bg={cardBg}
              borderRadius="2xl"
              overflow="hidden"
              border="1px solid"
              borderColor={cardBorderColor}
              transition="all 0.3s"
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
              _hover={{
                transform: 'translateY(-4px)',
                bg: cardHoverBg,
                boxShadow: '0 4px 20px rgba(74, 222, 128, 0.2)',
                borderColor: 'brand.primary',
                _before: {
                  background: 'linear-gradient(45deg, rgba(74, 222, 128, 0.2), rgba(74, 222, 128, 0))',
                }
              }}
            >
              <AspectRatio ratio={1}>
                <Box bg="gray.900" position="relative">
                  {totem.metadata?.image ? (
                    <>
                      <Image
                        src={`https://gateway.pinata.cloud/ipfs/${totem.metadata.image.replace('ipfs://', '')}`}
                        alt={totem.metadata?.name || 'Totem'}
                        objectFit="cover"
                        w="100%"
                        h="100%"
                        filter="brightness(0.9)"
                      />
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bgGradient="linear(to-t, rgba(17, 24, 39, 1), rgba(17, 24, 39, 0))"
                      />
                    </>
                  ) : (
                    <Flex
                      align="center"
                      justify="center"
                      h="100%"
                      color="gray.500"
                      fontSize="sm"
                      bgGradient="linear(to-br, gray.800, gray.900)"
                    >
                      No Image
                    </Flex>
                  )}
                </Box>
              </AspectRatio>

              <Stack p={4} spacing={3}>
                <Heading
                  as="h3"
                  size="sm"
                  color={textColor}
                  noOfLines={1}
                  fontWeight="bold"
                  letterSpacing="tight"
                >
                  {totem.metadata?.name || `Totem #${totem.totemId}`}
                </Heading>

                <Button
                  variant="outline"
                  size="sm"
                  height="32px"
                  px={3}
                  onClick={() => {
                    setSelectedTotem(totem);
                    setModalOpen(true);
                  }}
                  fontWeight="medium"
                  letterSpacing="wide"
                  rightIcon={<ExternalLinkIcon />}
                  position="relative"
                  borderWidth="1px"
                  borderStyle="solid"
                  borderColor="brand.primary"
                  bg="rgba(16, 185, 129, 0.05)"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: -1,
                    margin: '-2px',
                    borderRadius: 'inherit',
                    bgGradient: 'linear(to-r, brand.primary, brand.accent)',
                    opacity: 0.5
                  }}
                  _hover={{
                    bg: "rgba(16, 185, 129, 0.1)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 0 15px rgba(16, 185, 129, 0.2)",
                  }}
                >
                  View Details
                </Button>
              </Stack>
            </Box>
          ))}
        </Grid>
      </Box>

      {/* Modal for displaying totem details */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} isCentered>
        <ModalOverlay backdropFilter="blur(12px)" bg="rgba(11, 14, 26, 0.7)" />
        <ModalContent
          bg="rgba(17, 24, 39, 0.9)"
          border="1px solid"
          borderColor="brand.primary"
          borderRadius="xl"
          mx={4}
          boxShadow="0 0 30px rgba(16, 185, 129, 0.2)"
          width="350px"
          maxW="350px"
        >
          {selectedTotem && (
            <>
              <ModalHeader 
                color="white" 
                borderBottom="1px solid" 
                borderColor="whiteAlpha.100"
                bgGradient="linear(to-r, rgba(16, 185, 129, 0.1), transparent)"
              >
                <Text 
                  bgGradient="linear(to-r, brand.primary, brand.accent)" 
                  bgClip="text"
                  fontWeight="bold"
                >
                  {selectedTotem.metadata?.name || `Totem #${selectedTotem.totemId}`}
                </Text>
              </ModalHeader>
              <ModalCloseButton color="white" />
              <ModalBody py={6}>
                <Stack spacing={6}>
                  {selectedTotem.metadata?.image && (
                    <Flex justify="center" w="100%">
                      <Box
                        borderRadius="xl"
                        overflow="hidden"
                        position="relative"
                        width="200px"
                        height="200px"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                      >
                        <Image
                          src={`https://gateway.pinata.cloud/ipfs/${selectedTotem.metadata.image.replace('ipfs://', '')}`}
                          alt={selectedTotem.metadata?.name || 'Totem'}
                          objectFit="cover"
                          w="100%"
                          h="100%"
                        />
                      </Box>
                    </Flex>
                  )}
                  
                  <Box>
                    <Heading size="sm" color="gray.300" mb={2}>ID</Heading>
                    <Text color="white" fontWeight="medium">
                      {selectedTotem.totemId}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" color="gray.300" mb={2}>Description</Heading>
                    <Text color="gray.100">
                      {selectedTotem.metadata?.description || 'No description available'}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" color="gray.300" mb={2}>Totem Address</Heading>
                    <HStack>
                      <Text color="gray.100" fontFamily="mono" fontSize="sm">
                        {selectedTotem.totemAddr}
                      </Text>
                      <Link 
                        href={`https://soneium-minato.blockscout.com/address/${selectedTotem.totemAddr}`}
                        isExternal
                        color="brand.primary"
                      >
                        <Icon as={FaExternalLinkAlt} boxSize={3} />
                      </Link>
                    </HStack>
                  </Box>
                  
                  {selectedTotem.metadata?.attributes && selectedTotem.metadata.attributes.length > 0 && (
                    <Box>
                      <Heading size="sm" color="gray.300" mb={3}>Attributes</Heading>
                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        {selectedTotem.metadata.attributes.map((attr, idx) => (
                          <Box 
                            key={idx}
                            bg="whiteAlpha.100"
                            p={3}
                            borderRadius="lg"
                          >
                            <Text color="gray.400" fontSize="xs" fontWeight="bold" mb={1}>
                              {attr.trait_type}
                            </Text>
                            <Text color="white">{attr.value}</Text>
                          </Box>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  
                  <HStack spacing={4} pt={2}>
                    <Button
                      as="a"
                      href={`https://soneium-minato.blockscout.com/address/${selectedTotem.totemAddr}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outline"
                      size="sm"
                      leftIcon={<Icon as={FaExternalLinkAlt} />}
                      flex={1}
                    >
                      View on Blockscout
                    </Button>
                  </HStack>
                </Stack>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default TotemList;
