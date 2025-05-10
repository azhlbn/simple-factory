import React from 'react';
import {
  Box,
  Flex,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaMagic } from 'react-icons/fa';
import WalletConnect from './WalletConnect';
import TotemForm from './TotemForm';

const Navbar = ({ provider, onConnect }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('gray.900', 'gray.800');
  const borderColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('gray.100', 'gray.100');

  return (
    <>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={100}
        bg="rgba(11, 14, 26, 0.8)"
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        backdropFilter="blur(12px)"
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
      >
        <Flex
          maxW="7xl"
          mx="auto"
          px={6}
          py={3}
          align="center"
          justify="space-between"
        >
          <Flex align="center">
            <Text 
              fontWeight="bold" 
              fontSize="lg"
              bgGradient="linear(to-r, brand.primary, brand.accent)"
              bgClip="text"
            >
              Totem Factory
            </Text>
          </Flex>
          <Flex align="center" gap={4}>
            {provider && (
              <Button
                leftIcon={<FaMagic />}
                onClick={onOpen}
                variant="primary"
                size="md"
                height="38px"
                px={5}
              >
                Create Totem
              </Button>
            )}
            <Box>
              <WalletConnect onConnect={onConnect} />
            </Box>
          </Flex>
        </Flex>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay backdropFilter="blur(12px)" bg="rgba(11, 14, 26, 0.7)" />
        <ModalContent
          bg="rgba(17, 24, 39, 0.8)"
          border="1px solid"
          borderColor="brand.primary"
          borderRadius="xl"
          mx={4}
          boxShadow="0 0 30px rgba(16, 185, 129, 0.2)"
        >
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
              Create New Totem
            </Text>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            <TotemForm
              provider={provider}
              onSuccess={() => {
                onClose();
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Navbar;
