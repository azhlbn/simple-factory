import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ethers } from 'ethers';
import { GET_ALL_TOTEMS, formatIpfsUrl } from '../utils/graphql';
import { TOTEM_FACTORY_ADDRESS, TOTEM_FACTORY_ABI } from '../config/totem';
import axios from 'axios';
import { Card, Image, Loader, Message, Segment, Modal, Button } from 'semantic-ui-react';

const TotemList = ({ provider }) => {
  const [totems, setTotems] = useState([]);
  const [selectedTotem, setSelectedTotem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
                const url = formatIpfsUrl(`ipfs://${dataHashString}`);
                try {
                  const resp = await axios.get(url);
                  metadata = resp.data;
                } catch (e) {
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
        setError('Failed to load totem metadata');
        console.error('Error loading totem metadata:', err);
      }
    };
    fetchMetadata();
    return () => { cancelled = true; };
  }, [data, graphLoading, provider]);

  // UI Section Title
  const SectionTitle = (
    <div style={{margin: '2rem 0 1.5rem 0', textAlign: 'center'}}>
      <h2 style={{fontWeight: 700, fontSize: '1.5rem', color: '#444'}}>Recent Totems</h2>
    </div>
  );

  if (!provider) {
    return (
      <Segment basic textAlign="center">
        {SectionTitle}
        <Message warning>
          <Message.Header>Connect your wallet to view recent totems</Message.Header>
        </Message>
      </Segment>
    );
  }

  if (graphLoading || !data) {
    return (
      <Segment basic textAlign="center">
        {SectionTitle}
        <Loader active inline="centered" size="large" content="Loading Totems..." />
      </Segment>
    );
  }

  if (graphError) {
    return (
      <Segment basic textAlign="center">
        {SectionTitle}
        <Message negative>
          <Message.Header>Error loading totems</Message.Header>
          <p>Error loading totems: {graphError.message}</p>
        </Message>
      </Segment>
    );
  }

  if (!totems.length) {
    return (
      <Segment basic textAlign="center">
        {SectionTitle}
        <Message info>
          <Message.Header>No totems found</Message.Header>
          <p>Be the first to create a totem!</p>
        </Message>
      </Segment>
    );
  }

  return (
    <>
      {SectionTitle}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTotem(null);
        }}
      >
        <Modal.Header>
          {selectedTotem?.metadata?.name || `Totem #${selectedTotem?.totemId}`}
        </Modal.Header>
        <Modal.Content>
          {selectedTotem?.metadata?.image && (
            <Image
              src={formatIpfsUrl(selectedTotem.metadata.image)}
              wrapped
              ui={false}
              alt={selectedTotem.metadata?.name || 'Totem'}
            />
          )}
          <Modal.Description style={{ marginTop: '1rem' }}>
            <p><strong>Description:</strong> {selectedTotem?.metadata?.description || 'No description available'}</p>
            <p><strong>Totem ID:</strong> {selectedTotem?.totemId}</p>
            <p><strong>Totem Address:</strong> {selectedTotem?.totemAddr}</p>
            <p><strong>Token Address:</strong> {selectedTotem?.totemTokenAddr}</p>
            <p><strong>Created:</strong> {selectedTotem?.blockTimestamp ? new Date(parseInt(selectedTotem.blockTimestamp) * 1000).toLocaleString() : 'Unknown'}</p>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color='green' onClick={() => setModalOpen(false)}>
            Close
          </Button>
        </Modal.Actions>
      </Modal>
      <Card.Group itemsPerRow={4} doubling stackable>
        {totems.map((totem) => (
          <Card key={totem.id}>
            {totem.metadata?.image ? (
              <Image src={formatIpfsUrl(totem.metadata.image)} wrapped ui={false} alt={totem.metadata?.name || 'Totem'} />
            ) : (
              <Segment placeholder>
                <div style={{ color: '#888', marginTop: 8, textAlign: 'center' }}>No Image</div>
              </Segment>
            )}
            <Card.Content>
              <Card.Header>{totem.metadata?.name || `Totem #${totem.totemId}`}</Card.Header>
              <Card.Meta>ID: {totem.totemId}</Card.Meta>
              <Card.Description>
                {totem.metadata?.description ? (
                  <span>{totem.metadata.description}</span>
                ) : (
                  <span style={{ color: '#888', fontStyle: 'italic' }}>No description</span>
                )}
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <Button
                fluid
                basic
                color='green'
                onClick={() => {
                  setSelectedTotem(totem);
                  setModalOpen(true);
                }}
              >
                View Details
              </Button>
            </Card.Content>
          </Card>
        ))}
      </Card.Group>
    </>
  );
};

export default TotemList;
