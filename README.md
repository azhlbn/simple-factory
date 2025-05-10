# Totem Factory

A decentralized application for creating and managing digital Totems on the Minato blockchain network.

## Overview

Totem Factory allows users to create unique digital assets (Totems) with associated metadata and images stored on IPFS. Each Totem is represented by an ERC-20 token on the Minato blockchain. The application provides a user-friendly interface for creating, viewing, and managing these digital assets.

## Features

- **Create Totems**: Create unique digital assets with custom names, symbols, and images
- **View Totems**: Browse and view all created Totems with their details
- **Wallet Integration**: Connect with MetaMask wallet for blockchain interactions
- **IPFS Storage**: Store Totem metadata and images on IPFS via Pinata
- **Blockchain Explorer**: View transactions and contracts on Blockscout explorer
- **Responsive Design**: Modern UI with dark theme optimized for all devices
- **Real-time Data**: Fast data retrieval using The Graph protocol

## Technologies Used

- **Frontend**: Next.js, React, Chakra UI
- **Blockchain**: Ethereum/Minato, ethers.js
- **Data Storage**: IPFS (Pinata)
- **Indexing & Querying**: The Graph (GraphQL)
- **Wallet**: MetaMask integration
- **Styling**: Chakra UI with custom theme

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MetaMask browser extension
- Access to a Graph node or The Graph hosted service

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/azhlbn/totem-factory.git
   cd totem-factory
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory with the following variables (see `.env.example` for reference):
   ```
   NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
   NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_key
   NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## The Graph Integration

This project uses The Graph protocol to efficiently query blockchain data. The Graph is a decentralized protocol for indexing and querying blockchain data, making it much faster and more efficient than direct RPC calls.

### Subgraph Setup

The subgraph for this project is located in the `mytho-minato` directory. It indexes Totem creation events from the TotemFactory contract.

1. Navigate to the subgraph directory:
   ```bash
   cd mytho-minato
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Generate types from the GraphQL schema:
   ```bash
   npm run codegen
   # or
   yarn codegen
   ```

4. Build the subgraph:
   ```bash
   npm run build
   # or
   yarn build
   ```

5. Deploy the subgraph (requires access to a Graph node or The Graph hosted service):
   ```bash
   # For a local Graph node
   npm run deploy-local
   
   # For The Graph hosted service
   npm run deploy
   ```

### GraphQL Queries

The application uses Apollo Client to query the subgraph. The main queries are defined in `utils/graphql.js`. For example, to fetch all Totems:

```javascript
export const GET_ALL_TOTEMS = gql`
  query GetAllTotems($first: Int!, $skip: Int!) {
    totemCreateds(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: desc) {
      id
      totemAddr
      totemTokenAddr
      totemId
    }
  }
`;
```

## Usage Guide

### Connecting Your Wallet

1. Click the "Connect" button in the top-right corner of the application.
2. Approve the connection request in your MetaMask wallet.
3. Ensure you're connected to the Minato network (the app will prompt you to switch if needed).

### Creating a Totem

1. Click the "Create Totem" button in the navigation bar.
2. Fill in the required information:
   - **Totem Name**: A name for your Totem
   - **Totem Symbol**: A short symbol (like ETH, BTC)
   - **Description** (optional): A description of your Totem
   - **Collaborators** (optional): Comma-separated list of Ethereum addresses
   - **Image**: Upload an image for your Totem
3. Click "Create Totem" and confirm the transaction in MetaMask.
4. Wait for the transaction to be confirmed on the blockchain.
5. The new Totem will be indexed by The Graph and appear in the UI shortly after confirmation.

### Viewing Totems

- All created Totems are displayed on the home page, retrieved via The Graph.
- Click "View Details" on any Totem card to see more information.
- You can view the Totem on the Blockscout explorer by clicking the link in the details.

## Network Information

- **Network Name**: Minato
- **Block Explorer**: [Soneium Minato Blockscout](https://soneium-minato.blockscout.com/)
- **Chain ID**: 1946
- **Subgraph Endpoint**: [[Your subgraph endpoint URL](https://api.studio.thegraph.com/query/101656/mytho-minato/version/latest)]

## License

[MIT](LICENSE)
