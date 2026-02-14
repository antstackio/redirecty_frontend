import React, { useState, useRef } from 'react';
import { createUrl } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { QRCodeCanvas } from 'qrcode.react';

// Define a common interface for the form state
interface FormState {
  originalUrl: string;
  shortCode: string;
  title: string;
}

// Define a result state that contains all possible outcomes
interface RequestState {
  status: 'idle' | 'loading' | 'success' | 'error';
  shortUrl: string;
  error: string;
  copied: boolean;
  showQrCode: boolean;
}

const CreateUrl = () => {
  const navigate = useNavigate();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  // Form state
  const [formState, setFormState] = useState<FormState>({
    originalUrl: '',
    shortCode: '',
    title: '',
  });
  
  // Request state
  const [requestState, setRequestState] = useState<RequestState>({
    status: 'idle',
    shortUrl: '',
    error: '',
    copied: false,
    showQrCode: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const copyToClipboard = () => {
    if (requestState.shortUrl) {
      navigator.clipboard.writeText(requestState.shortUrl)
        .then(() => {
          toast.success('Short URL copied to clipboard!', {
            duration: 2000,
            icon: '📋',
          });
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
          toast.error('Failed to copy URL');
        });
    }
  };

  // Function to copy QR Code Image
  const copyQrCodeToClipboard = async () => {
    if (!qrCodeRef.current) {
      toast.error('QR Code element not found.');
      return;
    }

    const canvas = qrCodeRef.current.querySelector('canvas');
    if (!canvas) {
      toast.error('Could not find QR code canvas.');
      return;
    }

    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error('Failed to create QR code image blob.');
        return;
      }
      try {
        // IMPORTANT: You might need user interaction (like a click) 
        // immediately before calling write() for security reasons in some browsers.
        // Since this function IS called by a button click, it should be fine.
        await navigator.clipboard.write([ 
          new ClipboardItem({ 
            'image/png': blob 
          })
        ]);
        toast.success('QR Code image copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy QR code image: ', err);
        toast.error('Failed to copy QR code image.');
      }
    }, 'image/png');
  };

  // Function to go back to dashboard
  const goToDashboard = () => {
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setRequestState({
      status: 'loading',
      shortUrl: '',
      error: '',
      copied: false,
      showQrCode: false,
    });
    
    try {
      const result = await createUrl(
        formState.originalUrl, 
        formState.shortCode || undefined,
        formState.title || undefined
      );
      
      if (result.success) {
        setRequestState({
          status: 'success',
          shortUrl: result.shortUrl,
          error: '',
          copied: false,
          showQrCode: false,
        });
        
        // Reset form
        setFormState({
          originalUrl: '',
          shortCode: '',
          title: '',
        });
      } else {
        // Handle error
        const resultError = result.error || 'Unknown error';
        setRequestState({
          status: 'error',
          shortUrl: '',
          error: `Failed to create URL: ${resultError}`,
          copied: false,
          showQrCode: false,
        });
      }
    } catch (err) {
      let errorMessage = 'Unknown error';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object') {
        try {
          errorMessage = JSON.stringify(err);
        } catch {
          errorMessage = 'Invalid error format';
        }
      }
      
      setRequestState(prev => ({ 
        ...prev, 
        status: 'error', 
        shortUrl: '', 
        error: `Failed to create URL: ${errorMessage}`,
        showQrCode: false 
      }));
    }
  };

  const toggleQrCode = () => {
    setRequestState(prev => ({ ...prev, showQrCode: !prev.showQrCode }));
  };

  const { originalUrl, shortCode, title } = formState;
  const { status, shortUrl, error, showQrCode } = requestState;
  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="mb-4 flex items-center">
        <Button variant="link" asChild>
          <Link to="/" className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="animate-fade-up">
        <CardHeader>
          <CardTitle>Create a New URL</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="originalUrl" className="text-sm font-medium">
                Original URL
              </label>
              <Input
                id="originalUrl"
                name="originalUrl"
                type="url"
                value={originalUrl}
                onChange={handleInputChange}
                placeholder="https://example.com"
                required
              />
              <p className="text-sm text-gray-500">
                The URL you want to shorten
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title (optional)
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                value={title}
                onChange={handleInputChange}
                placeholder="e.g., My Awesome Blog Post"
              />
              <p className="text-sm text-gray-500">
                A descriptive title for this link (optional)
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="shortCode" className="text-sm font-medium">
                Custom Short Code (optional)
              </label>
              <Input
                id="shortCode"
                name="shortCode"
                type="text"
                value={shortCode}
                onChange={handleInputChange}
                placeholder="e.g., my-link"
              />
              <p className="text-sm text-gray-500">
                Leave blank to generate a random code
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create URL'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isSuccess && shortUrl && (
        <Card className="mt-4 animate-scale-in">
          <CardHeader>
            <CardTitle>URL Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center mt-2 bg-muted p-3 rounded-md relative">
              <a 
                href={shortUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline overflow-hidden text-ellipsis flex-1 mr-2"
              >
                {shortUrl}
              </a>
              <Button 
                onClick={copyToClipboard}
                variant="secondary"
                size="sm"
              >
                Copy
              </Button>
            </div>
            
            <div className="flex justify-center mt-3">
              <Button 
                onClick={toggleQrCode} 
                variant="outline" 
                size="sm"
              >
                {showQrCode ? 'Hide' : 'Generate'} QR Code
              </Button>
            </div>

            {showQrCode && (
              <div className="mt-3 space-y-3 animate-scale-in">
                <div 
                  ref={qrCodeRef} 
                  className="flex justify-center p-4 bg-white rounded-md border"
                >
                  <QRCodeCanvas value={shortUrl} size={128} />
                </div>
                <div className="flex justify-center">
                  <Button 
                    onClick={copyQrCodeToClipboard}
                    variant="outline"
                    size="sm"
                  >
                    Copy QR Code Image
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex justify-between pt-4 border-t mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setRequestState({
                    status: 'idle',
                    shortUrl: '',
                    error: '',
                    copied: false,
                    showQrCode: false,
                  });
                  setFormState({ originalUrl: '', shortCode: '', title: '' });
                }}
              >
                Create Another URL
              </Button>
              
              <Button
                onClick={goToDashboard}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Card className="mt-4 border-red-200">
          <CardHeader className="text-red-600">
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateUrl; 