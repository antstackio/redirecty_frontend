"use client" 

import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom'; // Use react-router-dom Link
import toast from 'react-hot-toast';
import { Copy, ExternalLink, BarChart3 } from "lucide-react";

import { getUrls, UrlWithVisits } from '../api'; // Adjusted path
import { Button } from "./ui/button"; // Reverted path
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"; // Reverted path
import { Input } from "./ui/input"; // Reverted path

// Helper function to generate the full short URL
const getFullShortUrl = (shortCode: string) => `https://antt.me/${shortCode}`;

export function UrlList() {
  const [urls, setUrls] = useState<UrlWithVisits[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state on new fetch
        const urlsData = await getUrls();
        // Filter out any potentially invalid entries just in case
        setUrls(urlsData.filter(url => url && typeof url === 'object' && url.shortCode)); 
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load URLs: ${errorMessage}`);
        console.error('Error fetching URLs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUrls();
  }, []);

  const copyToClipboard = (shortCode: string) => {
    const text = getFullShortUrl(shortCode);
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('URL copied!');
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
        toast.error('Failed to copy.');
      });
  };

  // Filter URLs based on search query (checking ONLY title)
  const filteredUrls = urls.filter(
    (url) => {
      // Removed checks for original and short URL
      const title = url.title?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      return title.includes(query); // Only check title
    }
  );

  if (loading) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-md border border-dashed">
        <p>Loading your URLs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 text-destructive shadow-sm p-6">
        <h3 className="font-semibold mb-2">Error Loading URLs</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Search URL by Title"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {filteredUrls.length === 0 && searchQuery ? ( // Show only if searching and no results
         <div className="flex h-[200px] w-full items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-medium">No URLs found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search query.</p>
          </div>
        </div>
      ) : filteredUrls.length === 0 && !searchQuery ? ( // Show if no URLs exist at all
         <div className="flex h-[200px] w-full items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-medium">No URLs Yet</h3>
            <p className="text-sm text-muted-foreground">Create a new shortened URL to get started.</p>
             <Button asChild className="mt-4">
              <Link to="/create-url">Create Your First URL</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredUrls.map((url) => {
             const fullShortUrl = getFullShortUrl(url.shortCode);
             const displayShortUrl = `antt.me/${url.shortCode}`; // For display without protocol
             
             return (
              <Card key={url.shortCode} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-3">
                  {url.title && (
                    <p className="text-sm font-medium text-foreground mb-1 truncate" title={url.title}>
                      {url.title}
                    </p>
                  )}
                  <CardTitle className="truncate text-sm font-normal text-muted-foreground leading-tight">
                    <a
                      href={url.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:underline"
                      title={url.originalUrl}
                    >
                      <span className="truncate">{url.originalUrl}</span> 
                      <ExternalLink className="ml-2 h-3 w-3 flex-shrink-0" />
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <div className="flex items-center justify-between rounded-md border p-2">
                    <a 
                      href={fullShortUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="truncate font-mono text-sm hover:underline mr-2"
                      title={fullShortUrl}
                    >
                      {displayShortUrl}
                    </a>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 flex-shrink-0"
                      onClick={() => copyToClipboard(url.shortCode)} 
                      aria-label="Copy Short URL"
                      title="Copy short URL"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/analytics/${url.shortCode}`}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analytics
                    </Link>
                  </Button>
                  
                  <div className="text-sm text-muted-foreground flex items-center">
                     <span>{url.visit_count ?? 0} visits</span>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 