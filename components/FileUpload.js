import React, { useState, useRef } from 'react';
import { Form, Button, Icon, Message } from 'semantic-ui-react';
import { uploadFileToPinata } from '../utils/pinata';

const FileUpload = ({ onFileUploaded }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const uploadToPinata = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      // Получаем ключи Pinata из переменных окружения
      const pinataApiKey = process.env.PINATA_API_KEY;
      const pinataSecretApiKey = process.env.PINATA_API_SECRET;

      // Загружаем файл на IPFS через Pinata
      const result = await uploadFileToPinata(file, pinataApiKey, pinataSecretApiKey);

      if (result.success) {
        setSuccess(true);
        
        // Передаем IPFS хеш родительскому компоненту
        onFileUploaded(result.IpfsHash);
      } else {
        throw new Error(result.error || 'Failed to upload file to IPFS');
      }
    } catch (err) {
      console.error('Error uploading to IPFS:', err);
      setError(err.message || 'Failed to upload file to IPFS. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Form>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            border: '2px dashed #ccc',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px',
            cursor: 'pointer',
            borderRadius: '5px',
          }}
          onClick={() => fileInputRef.current.click()}
        >
          <Icon name="file image outline" size="huge" />
          <p>Drag and drop an image here or click to select</p>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        {fileName && (
          <Message info>
            <p>
              <Icon name="file" /> {fileName}
            </p>
          </Message>
        )}

        {error && (
          <Message negative>
            <p>{error}</p>
          </Message>
        )}

        {success && (
          <Message positive>
            <p>File successfully uploaded to IPFS!</p>
          </Message>
        )}

        <Button
          primary
          loading={uploading}
          disabled={!file || uploading}
          onClick={uploadToPinata}
        >
          <Icon name="upload" /> Upload to IPFS
        </Button>
      </Form>
    </div>
  );
};

export default FileUpload;
