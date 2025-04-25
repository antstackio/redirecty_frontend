const baseUrl = 'https://antt.me/api'

// Define the interface for URL with visit count
export interface UrlWithVisits {
  shortCode: string;
  originalUrl: string;
  visit_count: number;
  title: string;
}

export const createUrl = async (originalUrl: string, shortCode?: string, title?: string) => {
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
      } catch (jsonError) {
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

export const getUrls = async (): Promise<UrlWithVisits[]> => {
  try {
    const response = await fetch(`${baseUrl}/urls`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URLs. Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle the specific response structure: 
    // { success: true, urls: { shortcode: { full_url: ..., visit_count: ..., title: ... } } }
    if (data && data.success === true && data.urls && typeof data.urls === 'object') {
      const processedUrls = Object.entries(data.urls).map(([shortCode, urlData]: [string, any]) => {
        const originalUrl = urlData?.full_url || 'Invalid URL Data'; 
        const visit_count = urlData?.visit_count ?? 0;
        const title = urlData?.title || '';
        
        return {
          shortCode,
          originalUrl: typeof originalUrl === 'string' ? originalUrl : String(originalUrl),
          visit_count: typeof visit_count === 'number' ? visit_count : 0,
          title: typeof title === 'string' ? title : String(title),
        };
      });
      return processedUrls;
    }

    // Keep array handling as a fallback, although less likely based on provided response
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        shortCode: item.shortCode || item.code || '',
        originalUrl: item.originalUrl || item.url || '',
        visit_count: item.visit_count ?? 0,
        title: item.title || ''
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting URLs:', error);
    throw error;
  }
};

export const getUrlAnalytics = async (shortCode: string): Promise<any> => {
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
