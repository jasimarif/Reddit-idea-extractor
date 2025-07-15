import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Download } from 'lucide-react';
import apiRequest from '../lib/apiRequest';

const FetchPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [status, setStatus] = useState('idle'); 
  const [errorMsg, setErrorMsg] = useState('');
  const [fetchCount, setFetchCount] = useState(0);

  const handleFetchIdeas = async () => {
    setIsLoading(true);
    setStatus('idle');

    try {
      const response = await apiRequest.post('/ideas/fetch-now');
      console.log('Fetch Ideas Response:', response);
      const count = response.data?.data?.savedCount || 0;
      setStatus('success');
      setLastFetch(new Date().toLocaleString());
      setFetchCount(count);
      setErrorMsg('');
    } catch (error) {
      console.error('Fetch Ideas Error:', error, error?.response?.data, error?.response?.status);
      setStatus('error');
      // Detect timeout error (axios and fetch both use 'timeout' in message)
      let msg = error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Unknown error occurred.';
      if (msg.toLowerCase().includes('timeout')) {
        msg = 'The request took too long and timed out. The Reddit API or backend may be slow. Please wait a bit and try again.';
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fetch Ideas (Dev Tool)
          </h1>
          <p className="text-gray-600">
            Manually trigger the backend to fetch new ideas from Reddit
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="h-10 w-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Reddit Data Fetcher
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              This will trigger the backend service to scrape new ideas from Reddit communities
              and update the database with fresh content.
            </p>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-green-800 font-medium">Fetch completed successfully!</div>
                <div className="text-green-600 text-sm">
                  {fetchCount} new ideas were processed and added to the database.
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-red-800 font-medium">Fetch failed</div>
                <div className="text-red-600 text-sm">
                  There was an error connecting to the Reddit API. Please try again.<br/>
                  <span style={{fontWeight:'bold'}}>Error:</span> {errorMsg}
                </div>
              </div>
            </div>
          )}

          {/* Fetch Button */}
          <div className="text-center mb-8">
            <button
              onClick={handleFetchIdeas}
              disabled={isLoading}
              className="inline-flex items-center space-x-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span>Fetching Ideas...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-6 w-6" />
                  <span>Fetch New Ideas</span>
                </>
              )}
            </button>
          </div>

          {/* Last Fetch Info */}
          {lastFetch && (
            <div className="text-center text-sm text-gray-500">
              Last fetch: {lastFetch}
            </div>
          )}

          {/* Loading Progress */}
          {isLoading && (
            <div className="mt-6">
              <div className="text-sm text-gray-600 text-center mb-2">
                Processing Reddit data...
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-green-600 text-2xl mb-2">💊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Health Communities</h3>
            <p className="text-sm text-gray-600">
              r/Health, r/mentalhealth, r/Anxiety, r/depression, r/fitness, and more
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-yellow-600 text-2xl mb-2">💸</div>
            <h3 className="font-semibold text-gray-900 mb-2">Wealth Communities</h3>
            <p className="text-sm text-gray-600">
              r/personalfinance, r/startups, r/Entrepreneur, r/smallbusiness, and more
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-pink-600 text-2xl mb-2">❤️</div>
            <h3 className="font-semibold text-gray-900 mb-2">Relationship Communities</h3>
            <p className="text-sm text-gray-600">
              r/relationships, r/relationship_advice, r/parenting, r/custody, and more
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FetchPage;
