import "semantic-ui-css/semantic.min.css";
import React, { useState } from "react";
import { Container, Header, Tab, Segment, Grid, Icon, Message } from "semantic-ui-react";
import { ethers } from "ethers";
import { ApolloProvider } from '@apollo/client';
import WalletConnect from "../components/WalletConnect";
import TotemForm from "../components/TotemForm";
import TotemViewer from "../components/TotemViewer";
import TotemList from "../components/TotemList";
import TokenAddressList from "../components/TokenAddressList";
import apolloClient from "../lib/apollo-client";

const backgroundStyle = {
    background: "linear-gradient(135deg, #0F1419 0%, #1A2129 100%)",
    minHeight: "100vh",
    padding: "40px 20px",
    color: "#E2E8F0",
    fontFamily: "'Inter', sans-serif",
};

const cardStyle = {
    background: "rgba(26, 33, 41, 0.95)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "2.5rem",
    width: "100%",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(12px)",
    marginBottom: "2rem"
};

const Index = () => {
    const [provider, setProvider] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    const handleConnect = (newProvider) => {
        setProvider(newProvider);
    };

    const panes = [
        {
            menuItem: { key: 'create', icon: 'magic', content: 'Create Totem' },
            render: () => (
                <Tab.Pane>
                    {provider ? (
                        <TotemForm provider={provider} />
                    ) : (
                        <Message warning>
                            <Message.Header>Connect Your Wallet</Message.Header>
                            <p>Please connect your MetaMask wallet to create a totem.</p>
                        </Message>
                    )}
                </Tab.Pane>
            ),
        },
        {
            menuItem: { key: 'view', icon: 'eye', content: 'View Totem' },
            render: () => (
                <Tab.Pane>
                    {provider ? (
                        <TotemViewer provider={provider} />
                    ) : (
                        <Message warning>
                            <Message.Header>Connect Your Wallet</Message.Header>
                            <p>Please connect your MetaMask wallet to view totem details.</p>
                        </Message>
                    )}
                </Tab.Pane>
            ),
        },
        {
            menuItem: { key: 'gallery', icon: 'images', content: 'Totems Gallery' },
            render: () => (
                <Tab.Pane>
                    {provider ? (
                        <TotemList provider={provider} />
                    ) : (
                        <Message warning>
                            <Message.Header>Connect Your Wallet</Message.Header>
                            <p>Please connect your MetaMask wallet to view the totems gallery.</p>
                        </Message>
                    )}
                </Tab.Pane>
            ),
        },
        {
            menuItem: { key: 'tokens', icon: 'list', content: 'Token Addresses' },
            render: () => (
                <Tab.Pane>
                    {provider ? (
                        <TokenAddressList provider={provider} />
                    ) : (
                        <Message warning>
                            <Message.Header>Connect Your Wallet</Message.Header>
                            <p>Please connect your MetaMask wallet to view token addresses.</p>
                        </Message>
                    )}
                </Tab.Pane>
            ),
        },
    ];

    return (
        <ApolloProvider client={apolloClient}>
            <div style={backgroundStyle}>
                <Container>
                    <div style={cardStyle}>
                        <Header as="h1" textAlign="center" style={{ color: "#E2E8F0", marginBottom: "2rem" }}>
                            <Icon name="cube" />
                            Totem Creator
                        </Header>
                        
                        <Segment basic>
                            <Grid columns={1}>
                                <Grid.Column>
                                    <Header as="h3" style={{ color: "#E2E8F0" }}>
                                        Connect Your Wallet
                                    </Header>
                                    <WalletConnect onConnect={handleConnect} />
                                </Grid.Column>
                            </Grid>
                        </Segment>
                        
                        {provider && (
                            <Segment basic>
                                <Tab 
                                    menu={{ secondary: true, pointing: true, inverted: true }} 
                                    panes={panes} 
                                    activeIndex={activeTab}
                                    onTabChange={(e, { activeIndex }) => setActiveTab(activeIndex)}
                                />
                            </Segment>
                        )}
                        
                        <Segment basic textAlign="center" style={{ marginTop: "2rem" }}>
                            <p style={{ color: "#9CA3AF" }}>
                                Create and manage unique tokens (Totems) with metadata stored on IPFS.
                                Each Totem is a smart contract in the blockchain linked to your metadata.
                            </p>
                        </Segment>
                    </div>
                </Container>
            </div>
        </ApolloProvider>
    );
};

export default Index;