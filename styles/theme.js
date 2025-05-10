import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#0B0E1A',  // Darker navy background
        color: 'white',
        backgroundImage: 'radial-gradient(circle at center, rgba(55, 65, 81, 0.05) 0%, transparent 100%)',
      },
    },
  },
  colors: {
    brand: {
      primary: '#10B981',    // Emerald green
      secondary: '#059669',  // Darker green
      accent: '#0EA5E9',     // Sky blue accent
    },
    gray: {
      900: '#030712',
      800: '#111827',
      700: '#1F2937',
      600: '#374151',
      500: '#6B7280',
      400: '#9CA3AF',
      300: '#D1D5DB',
      200: '#E5E7EB',
      100: '#F3F4F6',
      50: '#F9FAFB',
    },
  },
  components: {
    Container: {
      baseStyle: {
        maxW: '7xl',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'gray.800',
          borderRadius: 'xl',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'whiteAlpha.100',
          transition: 'all 0.3s',
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
            borderColor: 'brand.primary',
          },
        },
      },
    },
    Button: {
      baseStyle: {
        borderRadius: 'full',
        fontWeight: 'semibold',
        transition: 'all 0.2s',
      },
      variants: {
        primary: {
          bgGradient: 'linear(to-r, brand.primary, brand.accent)',
          color: 'white',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
            _disabled: {
              bgGradient: 'linear(to-r, brand.primary, brand.accent)',
              transform: 'none',
            },
          },
          _active: {
            transform: 'scale(0.98)',
          },
        },
        outline: {
          bg: 'transparent',
          color: 'white',
          position: 'relative',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'transparent',
          _before: {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: -1,
            margin: '-1px',
            borderRadius: 'inherit',
            bgGradient: 'linear(to-r, brand.primary, brand.accent)',
          },
          _hover: {
            bg: 'whiteAlpha.100',
            transform: 'translateY(-2px)',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)',
          },
          _active: {
            transform: 'scale(0.98)',
          },
        },
        ghost: {
          bg: 'whiteAlpha.50',
          color: 'white',
          _hover: {
            bg: 'whiteAlpha.200',
            transform: 'translateY(-2px)',
          },
          _active: {
            transform: 'scale(0.98)',
          },
        },
        link: {
          color: 'brand.primary',
          bg: 'transparent',
          padding: 0,
          height: 'auto',
          lineHeight: 'normal',
          _hover: {
            textDecoration: 'none',
            color: 'brand.accent',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        color: 'white',
      },
    },
  },
});

export default theme;
