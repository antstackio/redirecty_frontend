import React, { useState, useEffect, useTransition } from "react";
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import Copy from "lucide-react/dist/esm/icons/copy";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Search from "lucide-react/dist/esm/icons/search";

import { getUrls } from '../api';
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

// Helper function to generate the full short URL
const getFullShortUrl = (shortCode: string) => `https://antt.me/${shortCode}`;

export function UrlList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most-visits" | "least-visits" | "title-az" | "title-za">("newest");
  const [, startTransition] = useTransition();

  // Debounce search query — waits 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Scroll to top when page changes (not on search-triggered resets)
  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const { data: paginatedData, isLoading: loading, isValidating, error: swrError } = useSWR(
    `urls-page-${currentPage}-search-${debouncedSearch}-sort-${sortBy}`,
    () => getUrls(currentPage, 50, debouncedSearch, sortBy),
    { keepPreviousData: true },
  );
  const urls = paginatedData?.urls.filter(url => url && typeof url === 'object' && url.shortCode) ?? [];
  const total = paginatedData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / (paginatedData?.pageSize ?? 50)));
  const error = swrError ? `Failed to load URLs: ${swrError instanceof Error ? swrError.message : 'Unknown error'}` : null;
  const isFetchingNew = isValidating && !loading;

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

  // Sorting is now server-side; use the API order directly
  const sortedUrls = urls;

  return (
    <div className="space-y-6">
      {/* Search bar — always mounted so it never loses focus */}
      <div className="flex w-full items-center gap-2 flex-wrap animate-fade-up">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-colors duration-200" />
          <Input
            placeholder="Search by title or URL..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => startTransition(() => setSearchQuery(e.target.value))}
            className="pl-9"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => startTransition(() => { setSortBy(e.target.value as typeof sortBy); setCurrentPage(1); })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-shadow duration-200"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="most-visits">Most visits</option>
          <option value="least-visits">Least visits</option>
          <option value="title-az">Title A-Z</option>
          <option value="title-za">Title Z-A</option>
        </select>
      </div>

      {/* Subtle loading bar for search / pagination transitions */}
      <div className={`h-0.5 -mt-4 rounded-full overflow-hidden transition-opacity duration-300 ${isFetchingNew || loading ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-full w-1/3 bg-primary/50 rounded-full animate-progress-slide" />
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 animate-fade-in">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-6 space-y-4 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="space-y-2">
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
              </div>
              <div className="h-10 w-full rounded-md border bg-muted/50" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-8 w-24 rounded-md bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 text-destructive shadow-sm p-6 animate-fade-up">
          <h3 className="font-semibold mb-2">Error Loading URLs</h3>
          <p className="text-sm">{error}</p>
        </div>
      ) : sortedUrls.length === 0 && debouncedSearch ? (
         <div className="flex h-[200px] w-full items-center justify-center rounded-md border border-dashed animate-fade-up">
          <div className="text-center">
            <h3 className="text-lg font-medium">No URLs found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search query.</p>
          </div>
        </div>
      ) : sortedUrls.length === 0 && !debouncedSearch ? (
         <div className="flex h-[200px] w-full items-center justify-center rounded-md border border-dashed animate-fade-up">
          <div className="text-center">
            <h3 className="text-lg font-medium">No URLs Yet</h3>
            <p className="text-sm text-muted-foreground">Create a new shortened URL to get started.</p>
             <Button asChild className="mt-4">
              <Link to="/create-url">Create Your First URL</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className={`grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 transition-opacity duration-300 ${isFetchingNew ? 'opacity-50' : 'opacity-100'}`}>
          {sortedUrls.map((url, index) => {
             const fullShortUrl = getFullShortUrl(url.shortCode);
             const displayShortUrl = `antt.me/${url.shortCode}`;

             return (
              <Card
                key={url.shortCode}
                className="animate-fade-up overflow-hidden flex flex-col transition-[transform,box-shadow] duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
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
                      className="h-7 w-7 flex-shrink-0 transition-transform duration-150 active:scale-90"
                      onClick={() => copyToClipboard(url.shortCode)}
                      aria-label="Copy Short URL"
                      title="Copy short URL"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-3">
                  {(url.visitCount ?? 0) > 0 ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/analytics/${url.shortCode}`}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled className="opacity-50">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analytics
                    </Button>
                  )}

                  <div className="text-sm text-muted-foreground flex items-center">
                     <span>{url.visitCount ?? 0} visits</span>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2 animate-fade-in">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="transition-all duration-200"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="transition-all duration-200"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
