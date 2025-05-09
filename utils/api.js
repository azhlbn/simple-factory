// API utilities for interacting with IPFS via Pinata and The Graph

/**
 * Unpins a file from IPFS via Pinata service
 * @param {string} hash - The IPFS hash (CID) to unpin
 * @returns {Promise<{success: boolean, error: string}>} - Result object
 */
export const unpinFromIPFS = async (hash) => {
  try {
    if (!hash) {
      return { success: false, error: 'No hash provided' };
    }
    
    // Make API request to Pinata unpin endpoint
    const res = await fetch(`https://api.pinata.cloud/pinning/unpin/${hash}`, {
      method: 'DELETE',
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY || process.env.NEXT_PUBLIC_PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_API_SECRET || process.env.NEXT_PUBLIC_PINATA_API_SECRET,
      }
    });

    if (res.ok) {
      return {
        success: true,
        error: '',
      };
    } else {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Failed to unpin hash ${hash}`);
    }
  } catch (error) {
    console.error('Error unpinning from IPFS:', error);
    return {
      success: false,
      error: error.message || 'Failed to unpin from IPFS',
    };
  }
};

/**
 * Uploads a file to IPFS via Pinata service
 * @param {File} file - The file to upload
 * @returns {Promise<{success: boolean, cid: string, error: string}>} - Result object with CID or error
 */
export const uploadFileToIPFS = async (file) => {
  try {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);

    // You can add metadata if needed
    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);

    // Optional pinata options
    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', pinataOptions);

    // Make API request to Pinata
    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY || process.env.NEXT_PUBLIC_PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_API_SECRET || process.env.NEXT_PUBLIC_PINATA_API_SECRET,
      },
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      return {
        success: true,
        cid: data.IpfsHash,
        error: '',
      };
    } else {
      throw new Error(data.error || 'Failed to upload to Pinata');
    }
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return {
      success: false,
      cid: '',
      error: error.message || 'Failed to upload to IPFS',
    };
  }
};

/**
 * Uploads JSON metadata to IPFS via Pinata service
 * @param {Object} metadata - The metadata object to upload
 * @returns {Promise<{success: boolean, cid: string, error: string}>} - Result object with CID or error
 */
export const uploadMetadataToIPFS = async (metadata) => {
  try {
    const data = JSON.stringify(metadata);
    
    // Make API request to Pinata JSON API
    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: process.env.PINATA_API_KEY || process.env.NEXT_PUBLIC_PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_API_SECRET || process.env.NEXT_PUBLIC_PINATA_API_SECRET,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: 'TotemMetadata',
        },
        pinataOptions: {
          cidVersion: 0
        }
      }),
    });

    const responseData = await res.json();

    if (res.ok) {
      return {
        success: true,
        cid: responseData.IpfsHash,
        error: '',
      };
    } else {
      throw new Error(responseData.error || 'Failed to upload metadata to Pinata');
    }
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    return {
      success: false,
      cid: '',
      error: error.message || 'Failed to upload metadata to IPFS',
    };
  }
};

/**
 * Uploads a totem (image + metadata) to IPFS
 * @param {File} imageFile - The image file to upload
 * @param {Object} metadata - The metadata object for the totem
 * @returns {Promise<{success: boolean, cid: string, error: string}>} - Result object with final metadata CID or error
 */
export const uploadTotemToIPFS = async (imageFile, metadata) => {
  try {
    // First upload the image file
    const imageResult = await uploadFileToIPFS(imageFile);
    
    if (!imageResult.success) {
      throw new Error(imageResult.error || 'Failed to upload image to IPFS');
    }
    
    // Add the image CID to the metadata
    const fullMetadata = {
      ...metadata,
      image: `ipfs://${imageResult.cid}`,
      imageUrl: `https://gateway.pinata.cloud/ipfs/${imageResult.cid}`,
    };
    
    // Then upload the complete metadata
    const metadataResult = await uploadMetadataToIPFS(fullMetadata);
    
    if (!metadataResult.success) {
      throw new Error(metadataResult.error || 'Failed to upload metadata to IPFS');
    }
    
    return {
      success: true,
      cid: metadataResult.cid,
      imageCid: imageResult.cid,
      error: '',
    };
  } catch (error) {
    console.error('Error uploading totem to IPFS:', error);
    return {
      success: false,
      cid: '',
      imageCid: '',
      error: error.message || 'Failed to upload totem to IPFS',
    };
  }
};
