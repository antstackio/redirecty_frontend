const baseUrl = 'https://antt.me/api'

// Define the interface for URL with visit count
export interface UrlWithVisits {
  shortCode: string;
  originalUrl: string;
  visitCount: number;
  title: string | null;
  createdAt: string | null;
}

export interface PaginatedUrlsResponse {
  urls: UrlWithVisits[];
  total: number;
  page: number;
  pageSize: number;
}

interface UrlDataApiResponse {
  full_url: string;
  visit_count: number | null;
  title: string | null;
  created_at: string | null;
}

export interface CreateUrlResponse {
  success: boolean;
  shortCode?: string;
  shortUrl: string;
  error?: string;
}

export interface AnalyticsApiResponse {
  success: boolean;
  error?: string;
  analytics?: {
    shortCode: string;
    originalUrl: string;
    title?: string;
    totalVisits: string | number;
    referrers: Record<string, string | number>;
    countries: Record<string, string | number>;
    lastUpdated: string;
  };
}

export const createUrl = async (originalUrl: string, shortCode?: string, title?: string): Promise<CreateUrlResponse> => {
  try {
    // Ensure originalUrl is properly formatted
    let formattedUrl = originalUrl;
    if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
      formattedUrl = `https://${originalUrl}`;
    }
    
    // Add title to body type definition
    const body: { url: string; shortCode?: string; title?: string } = { url: formattedUrl };
    if (shortCode && shortCode.trim() !== '') {
      body.shortCode = shortCode.trim();
    }
    // Add title to body if provided
    if (title && title.trim() !== '') {
      body.title = title.trim();
    }
    
    const response = await fetch(`${baseUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      let errorMessage = `Failed to create URL. Status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse the JSON, just log the raw text
        const errorText = await response.text().catch(() => '');
        console.error('Error response text:', errorText);
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();    
    // Transform the response to match the expected format in our app
    return {
      success: data.success,
      shortCode: data.code,
      shortUrl: data.shortUrl
    };
  } catch (error) {
    console.error('Error creating URL:', error);
    throw error;
  }
};

export const getUrls = async (page: number = 1, pageSize: number = 50, search: string = '', sort: string = 'newest'): Promise<PaginatedUrlsResponse> => {
  try {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set('search', search);
    if (sort && sort !== 'newest') params.set('sort', sort);
    const response = await fetch(`${baseUrl}/urls?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch URLs. Status: ${response.status}`);
    }

    const data = await response.json();

    let processedUrls: UrlWithVisits[] = [];

    // Handle the specific response structure:
    // { success: true, urls: { shortcode: { full_url: ..., visit_count: ..., title: ... } } }
    if (data && data.success === true && data.urls && typeof data.urls === 'object') {
      processedUrls = Object.entries(data.urls).map(([shortCode, urlData]: [string, UrlDataApiResponse]) => {
        const originalUrl = urlData?.full_url || 'Invalid URL Data';
        const visitCount = urlData?.visit_count ?? 0;
        const title = urlData?.title || '';
        const createdAt = urlData?.created_at || null;

        return {
          shortCode,
          originalUrl: typeof originalUrl === 'string' ? originalUrl : String(originalUrl),
          visitCount: typeof visitCount === 'number' ? visitCount : 0,
          title: typeof title === 'string' ? title : String(title),
          createdAt,
        };
      });
    } else if (Array.isArray(data)) {
      // Keep array handling as a fallback, although less likely based on provided response
      processedUrls = data.map((item: Record<string, unknown>) => ({
        shortCode: String(item.shortCode || item.code || ''),
        originalUrl: String(item.originalUrl || item.url || ''),
        visitCount: typeof item.visit_count === 'number' ? item.visit_count : 0,
        title: String(item.title || ''),
        createdAt: typeof item.created_at === 'string' ? item.created_at : null,
      }));
    }

    return {
      urls: processedUrls,
      total: data.total ?? processedUrls.length,
      page: data.page ?? page,
      pageSize: data.pageSize ?? pageSize,
    };
  } catch (error) {
    console.error('Error getting URLs:', error);
    throw error;
  }
};

export const getUrlAnalytics = async (shortCode: string): Promise<AnalyticsApiResponse> => {
  try {
    // Removed accountId and apiKey fetching
    // const accountId = import.meta.env.VITE_CF_ACCOUNT_ID;
    // const apiKey = import.meta.env.VITE_CF_API_KEY;
    
    // Removed check for accountId and apiKey
    // if (!accountId || !apiKey) { ... }
    
    const encodedShortCode = encodeURIComponent(shortCode);
    // Removed encoding for accountId and apiKey
    // const encodedAccountId = encodeURIComponent(accountId);
    // const encodedApiKey = encodeURIComponent(apiKey);
    
    // Updated fetch URL to remove query parameters
    const response = await fetch(
      `https://antt.me/api/analytics/${encodedShortCode}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', response.status, errorText);
      // Simplified error response
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    
    // If the API doesn't return data in the expected format, transform it
    if (data && !data.success && !data.analytics) {
      return {
        success: true,
        analytics: {
          shortCode: shortCode,
          originalUrl: data.originalUrl || "Unknown URL",
          totalVisits: data.totalVisits || "0",
          referrers: data.referrers || { "direct": "0" },
          countries: data.countries || { "Unknown": "0" },
          lastUpdated: new Date().toISOString()
        }
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
