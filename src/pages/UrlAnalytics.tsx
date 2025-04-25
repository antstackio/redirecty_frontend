import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { getUrlAnalytics } from '../api';
import toast from 'react-hot-toast';

interface AnalyticsData {
  shortCode: string;
  originalUrl: string;
  title: string;
  totalVisits: string | number;
  referrers: Record<string, string | number>;
  countries: Record<string, string | number>;
  lastUpdated: string;
}


const UrlAnalytics = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestTime, setRequestTime] = useState<number | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!shortCode) {
        setError("No short code provided");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const startTime = Date.now();
      try {
        console.log(`Fetching analytics for short code: ${shortCode}`);
        const data = await getUrlAnalytics(shortCode);
        const endTime = Date.now();
        setRequestTime(endTime - startTime);
        
        console.log('Raw Analytics API response:', data);
        console.log('Response type:', typeof data);
        console.log('Response structure:', JSON.stringify(data, null, 2));
        
        if (data && data.success && data.analytics) {
          console.log('Analytics data found:', data.analytics);
          setAnalytics(data.analytics);
          setError(null);
        } else if (data && !data.success && data.error) {
          console.error('API returned error:', data.error);
          setError(data.error);
          toast.error(data.error);
        } else {
          console.warn('No analytics data in response:', data);
          setError('No analytics data found');
        }
      } catch (err) {
        const endTime = Date.now();
        setRequestTime(endTime - startTime);
        console.error('Error fetching analytics:', err);
        let errorMessage = 'Failed to load analytics data';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [shortCode]);

  const toNumber = (value: string | number | undefined): number => {
    if (value === undefined) return 0;
    if (typeof value === 'number') return value;
    return parseInt(value, 10) || 0;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Button variant="link" asChild>
          <Link to="/dashboard" className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Analytics for {shortCode}</h1>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p>Loading analytics data...</p>
              <p className="text-xs text-gray-500">This may take a few seconds</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardHeader className="text-red-600">
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            {requestTime && <p className="text-xs text-gray-500 mt-2">Request took {requestTime}ms</p>}
          </CardContent>
        </Card>
      ) : analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.title && (
                <p className="text-lg font-medium mb-2" title={analytics.title}>
                  {analytics.title}
                </p>
              )}
              <p className="text-sm mb-2">
                Original URL: <a href={analytics.originalUrl} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{analytics.originalUrl}</a>
              </p>
              <div className="text-3xl font-bold">{toNumber(analytics.totalVisits)} visits</div>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
              </p>
              {requestTime && <p className="text-xs text-gray-500 mt-2">Request took {requestTime}ms</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(analytics.referrers).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(analytics.referrers)
                    .sort(([, a], [, b]) => toNumber(b) - toNumber(a))
                    .map(([referrer, count]) => (
                      <li key={referrer} className="flex justify-between">
                        <span className="truncate mr-2">{referrer || 'Direct'}</span>
                        <span className="font-semibold">{toNumber(count)}</span>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-500">No referrer data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Countries</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(analytics.countries).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(analytics.countries)
                    .sort(([, a], [, b]) => toNumber(b) - toNumber(a))
                    .map(([country, count]) => (
                      <li key={country} className="flex justify-between">
                        <span>{country || 'Unknown'}</span>
                        <span className="font-semibold">{toNumber(count)}</span>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-500">No country data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p>No analytics data available for this URL.</p>
            {requestTime && <p className="text-xs text-gray-500 mt-2">Request took {requestTime}ms</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UrlAnalytics; 