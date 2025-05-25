import React, { useState, useRef } from 'react';
import { Upload, ImageIcon, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { storeNFT } from '../services/nftStorage';
import { mintNFT } from '../services/blockchain';

interface FormData {
  name: string;
  description: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

const initialAttributes = [{ trait_type: 'Category', value: 'Digital Art' }];

const MintPage: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    attributes: [...initialAttributes],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ tokenId: number; transactionHash: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleAttributeChange = (index: number, field: 'trait_type' | 'value', value: string) => {
    const updatedAttributes = [...formData.attributes];
    updatedAttributes[index][field] = value;
    setFormData({ ...formData, attributes: updatedAttributes });
  };
  
  const addAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, { trait_type: '', value: '' }],
    });
  };
  
  const removeAttribute = (index: number) => {
    const updatedAttributes = [...formData.attributes];
    updatedAttributes.splice(index, 1);
    setFormData({ ...formData, attributes: updatedAttributes });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      setError('Please select an image file');
      return;
    }
    
    if (!formData.name.trim()) {
      setError('Please enter a name for your NFT');
      return;
    }
    
    try {
      setError(null);
      setIsUploading(true);
      
      // Upload to IPFS
      const tokenURI = await storeNFT(
        imageFile,
        formData.name,
        formData.description,
        formData.attributes.filter(attr => attr.trait_type && attr.value)
      );
      
      setIsUploading(false);
      setIsMinting(true);
      
      // Mint NFT
      const result = await mintNFT(tokenURI);
      
      setSuccess(result);
      
      // Reset form
      setImageFile(null);
      setImagePreview(null);
      setFormData({
        name: '',
        description: '',
        attributes: [...initialAttributes],
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error('Mint error:', err);
    } finally {
      setIsUploading(false);
      setIsMinting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mint New NFT</h1>
      
      {success ? (
        <Card className="bg-green-50 border border-green-100">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-3 mb-4">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                NFT Minted Successfully!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Your NFT has been minted and added to the blockchain.
              </p>
              
              <div className="flex flex-col space-y-2 text-sm bg-white p-4 rounded-md border border-green-100 mb-4">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Token ID:</span>
                  <span className="text-gray-900">{success.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Transaction:</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${success.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 truncate max-w-[200px]"
                  >
                    {success.transactionHash.substring(0, 10)}...
                  </a>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setSuccess(null)}
                >
                  Mint Another
                </Button>
                <Button
                  as="a"
                  href="/"
                >
                  View Gallery
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div>
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Upload Artwork</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col items-center justify-center">
                  <div
                    className={`w-full aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer ${
                      imagePreview
                        ? 'border-transparent'
                        : 'border-gray-300 hover:border-purple-500'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="NFT Preview"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-center p-6">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Click to upload image</p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG or GIF (Max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    type="button"
                    variant={imagePreview ? 'outline' : 'primary'}
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    icon={<Upload className="h-4 w-4" />}
                  >
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* NFT Details */}
            <div>
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>NFT Details</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        placeholder="e.g., Digital Masterpiece #1"
                      />
                    </div>
                    
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        placeholder="Describe your NFT..."
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Attributes
                        </label>
                        <button
                          type="button"
                          onClick={addAttribute}
                          className="text-xs text-purple-600 hover:text-purple-800"
                        >
                          + Add Attribute
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {formData.attributes.map((attr, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="Trait"
                              value={attr.trait_type}
                              onChange={(e) =>
                                handleAttributeChange(index, 'trait_type', e.target.value)
                              }
                              className="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Value"
                              value={attr.value}
                              onChange={(e) =>
                                handleAttributeChange(index, 'value', e.target.value)
                              }
                              className="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            />
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => removeAttribute(index)}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isUploading || isMinting}
                  >
                    {isUploading
                      ? 'Uploading to IPFS...'
                      : isMinting
                      ? 'Minting NFT...'
                      : 'Mint NFT'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default MintPage;