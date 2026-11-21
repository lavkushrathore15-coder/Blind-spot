const crypto = require('crypto');
const config = require('../config/env');
const ApiError = require('../utils/apiError');

const SERPAPI_URL = 'https://serpapi.com/search.json';
const REQUEST_TIMEOUT_MS = 10000;

class SerpApiService {
  /**
   * Check configuration and credential status
   */
  static getStatus() {
    const isConfigured = Boolean(
      config.apiKeys.serpApiKey &&
      config.apiKeys.serpApiKey.trim() !== '' &&
      config.apiKeys.serpApiKey !== 'your_serpapi_key_here'
    );

    return {
      configured: isConfigured,
      service: 'SerpApi Search & News Engine',
      supportedFeatures: [
        'Destination-specific Google Search',
        'Google News Live Ingestion',
        'Consular Travel Advisory Discovery',
        'Transport Disruption Monitoring',
        'Local Scam & Street Hazard Telemetry',
      ],
      message: isConfigured
        ? 'SerpApi credentials configured and verified live on backend'
        : 'SerpApi credentials unavailable. Set SERPAPI_API_KEY in backend/.env to activate live Google searches.',
      verified: isConfigured,
    };
  }

  /**
   * Helper to perform validated HTTP fetch to SerpApi
   */
  static async executeSerpApiQuery(params) {
    const apiKey = config.apiKeys.serpApiKey;

    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_serpapi_key_here') {
      throw ApiError.unauthorized(
        'SerpApi API key not configured on backend. Set SERPAPI_API_KEY in backend/.env to perform live searches.'
      );
    }

    // Build URL with actual SerpApi parameters
    const queryParams = new URLSearchParams({
      api_key: apiKey,
      ...params,
    });

    const fullUrl = `${SERPAPI_URL}?${queryParams.toString()}`;

    let response;
    try {
      response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BlindSpot-Intelligence/2.0',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        throw new ApiError(504, 'SerpApi request timed out after 10 seconds.');
      }
      throw new ApiError(502, `Failed to communicate with SerpApi: ${err.message}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      throw new ApiError(502, 'SerpApi returned an unparseable response.');
    }

    // Handle SerpApi HTTP status codes and response errors
    if (!response.ok || data.error) {
      const errorMsg = data.error || `SerpApi returned HTTP status ${response.status}`;
      if (response.status === 401 || response.status === 403 || errorMsg.toLowerCase().includes('api key')) {
        throw ApiError.unauthorized(`SerpApi Authentication Failed: ${errorMsg}`);
      }
      if (response.status === 429 || errorMsg.toLowerCase().includes('rate limit')) {
        throw new ApiError(429, `SerpApi Rate Limit Exceeded: ${errorMsg}`);
      }
      throw new ApiError(response.status || 500, `SerpApi Error: ${errorMsg}`);
    }

    return data;
  }

  /**
   * Clean and normalize raw result items into a consistent data structure
   */
  static normalizeItem(raw, category = 'general') {
    const rawUrl = raw.link || raw.url || '';
    const cleanUrl = SerpApiService.cleanUrl(rawUrl);

    // Derive readable source name
    let sourceName = 'Web Source';
    if (typeof raw.source === 'string') {
      sourceName = raw.source;
    } else if (raw.source && raw.source.name) {
      sourceName = raw.source.name;
    } else if (cleanUrl) {
      try {
        sourceName = new URL(cleanUrl).hostname.replace(/^www\./, '');
      } catch (e) {
        sourceName = 'Web Source';
      }
    }

    // Generate unique reproducible ID
    const hash = crypto
      .createHash('sha256')
      .update(`${cleanUrl || raw.title || ''}-${raw.snippet || ''}`)
      .digest('hex')
      .substring(0, 16);

    return {
      id: `serp-${hash}`,
      title: raw.title ? raw.title.trim() : 'Untitled Intelligence Record',
      snippet: raw.snippet ? raw.snippet.trim() : raw.description ? raw.description.trim() : '',
      sourceUrl: cleanUrl,
      sourceName,
      publishedDate: raw.date || raw.published_date || null,
      retrievedAt: new Date().toISOString(),
      category,
      rawPosition: raw.position || null,
    };
  }

  /**
   * Remove tracking query parameters and fragments from URLs for clean deduplication
   */
  static cleanUrl(urlString) {
    if (!urlString) return '';
    try {
      const u = new URL(urlString);
      // Remove common tracking parameters
      const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
      paramsToRemove.forEach((p) => u.searchParams.delete(p));
      u.hash = '';
      return u.toString();
    } catch (e) {
      return urlString.trim();
    }
  }

  /**
   * Deduplicate items based on cleaned URL and title similarity
   */
  static deduplicate(items) {
    const seenUrls = new Set();
    const seenTitles = new Set();
    const deduplicated = [];

    for (const item of items) {
      const normUrl = item.sourceUrl.toLowerCase();
      const normTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (normUrl && seenUrls.has(normUrl)) {
        continue;
      }
      if (normTitle && seenTitles.has(normTitle)) {
        continue;
      }

      if (normUrl) seenUrls.add(normUrl);
      if (normTitle) seenTitles.add(normTitle);
      deduplicated.push(item);
    }

    return deduplicated;
  }

  /**
   * 1. Destination-Specific Google Search
   */
  static async searchDestination(destination, options = {}) {
    const query = options.query || `${destination} travel safety security precautions`;
    const params = {
      engine: 'google',
      q: query,
      hl: options.hl || 'en',
      gl: options.gl || 'us',
      num: options.num || 10,
    };

    const raw = await SerpApiService.executeSerpApiQuery(params);
    const rawResults = raw.organic_results || [];
    const normalized = rawResults.map((r) => SerpApiService.normalizeItem(r, 'general'));

    return {
      destination,
      query,
      category: 'general',
      count: normalized.length,
      results: SerpApiService.deduplicate(normalized),
      searchInformation: raw.search_information || null,
    };
  }

  /**
   * 2. Google News Search
   */
  static async searchNews(destination, options = {}) {
    const query = options.query || `${destination} travel safety OR security incident OR protest`;
    const params = {
      engine: 'google_news',
      q: query,
      hl: options.hl || 'en',
      gl: options.gl || 'us',
    };

    const raw = await SerpApiService.executeSerpApiQuery(params);
    const rawNews = raw.news_results || [];
    const normalized = rawNews.map((r) => SerpApiService.normalizeItem(r, 'news'));

    return {
      destination,
      query,
      category: 'news',
      count: normalized.length,
      results: SerpApiService.deduplicate(normalized),
    };
  }

  /**
   * 3. Travel Advisory Discovery
   */
  static async searchTravelAdvisories(destination, options = {}) {
    const query = options.query || `${destination} ("travel advisory" OR "travel warning" OR "security alert") (site:gov OR site:gc.ca OR site:gov.uk OR site:state.gov OR "travel advisory")`;
    const params = {
      engine: 'google',
      q: query,
      hl: options.hl || 'en',
      gl: options.gl || 'us',
      num: options.num || 10,
    };

    const raw = await SerpApiService.executeSerpApiQuery(params);
    const rawResults = raw.organic_results || [];
    const normalized = rawResults.map((r) => SerpApiService.normalizeItem(r, 'advisory'));

    return {
      destination,
      query,
      category: 'advisory',
      count: normalized.length,
      results: SerpApiService.deduplicate(normalized),
    };
  }

  /**
   * 4. Transport Disruption Discovery
   */
  static async searchTransportDisruptions(destination, options = {}) {
    const query = options.query || `${destination} (transit strike OR airport disruption OR train delay OR metro shutdown OR road closure OR taxi protest)`;
    const params = {
      engine: 'google_news',
      q: query,
      hl: options.hl || 'en',
      gl: options.gl || 'us',
    };

    const raw = await SerpApiService.executeSerpApiQuery(params);
    const rawNews = raw.news_results || [];
    const normalized = rawNews.map((r) => SerpApiService.normalizeItem(r, 'transit'));

    return {
      destination,
      query,
      category: 'transit',
      count: normalized.length,
      results: SerpApiService.deduplicate(normalized),
    };
  }

  /**
   * 5. Local Concern and Reported Scam Discovery
   */
  static async searchScamsAndConcerns(destination, options = {}) {
    const query = options.query || `${destination} (tourist scam OR pickpocket hotspot OR taxi scam OR street safety warning OR theft alert)`;
    const params = {
      engine: 'google',
      q: query,
      hl: options.hl || 'en',
      gl: options.gl || 'us',
      num: options.num || 10,
    };

    const raw = await SerpApiService.executeSerpApiQuery(params);
    const rawResults = raw.organic_results || [];
    const normalized = rawResults.map((r) => SerpApiService.normalizeItem(r, 'scam'));

    return {
      destination,
      query,
      category: 'scam',
      count: normalized.length,
      results: SerpApiService.deduplicate(normalized),
    };
  }

  /**
   * Aggregated Multi-Stream Intelligence Feed
   * Runs all 5 discovery pipelines and returns unified, deduplicated telemetry.
   */
  static async getAggregatedLiveIntelligence(destination, options = {}) {
    const [general, news, advisories, transit, scams] = await Promise.allSettled([
      SerpApiService.searchDestination(destination, options),
      SerpApiService.searchNews(destination, options),
      SerpApiService.searchTravelAdvisories(destination, options),
      SerpApiService.searchTransportDisruptions(destination, options),
      SerpApiService.searchScamsAndConcerns(destination, options),
    ]);

    const allItems = [];
    const moduleStatus = {
      general: general.status === 'fulfilled',
      news: news.status === 'fulfilled',
      advisories: advisories.status === 'fulfilled',
      transit: transit.status === 'fulfilled',
      scams: scams.status === 'fulfilled',
    };

    if (general.status === 'fulfilled') allItems.push(...general.value.results);
    if (news.status === 'fulfilled') allItems.push(...news.value.results);
    if (advisories.status === 'fulfilled') allItems.push(...advisories.value.results);
    if (transit.status === 'fulfilled') allItems.push(...transit.value.results);
    if (scams.status === 'fulfilled') allItems.push(...scams.value.results);

    const deduplicated = SerpApiService.deduplicate(allItems);

    return {
      destination,
      retrievedAt: new Date().toISOString(),
      totalResults: deduplicated.length,
      moduleStatus,
      streams: {
        advisories: deduplicated.filter((i) => i.category === 'advisory'),
        news: deduplicated.filter((i) => i.category === 'news'),
        transit: deduplicated.filter((i) => i.category === 'transit'),
        scams: deduplicated.filter((i) => i.category === 'scam'),
        general: deduplicated.filter((i) => i.category === 'general'),
      },
      feed: deduplicated,
    };
  }
}

module.exports = SerpApiService;
