'use client';

import { useState, useEffect } from 'react';

// Builder.io configuration
const BUILDER_API_KEY = '2ae809b78ebd4061a48182978eb8bd59';

export default function BuilderVCPLoader({ vcpId = 'vcp-e491ce2165ed41a2b1647853c8fdde3c' }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVCPContent = async () => {
      try {
        setLoading(true);

        // Fetch content using Builder.io Content API
        const response = await fetch(
          `https://cdn.builder.io/api/v3/content/quickcopy/${vcpId}?apiKey=${BUILDER_API_KEY}`
        );

        if (response.ok) {
          const data = await response.json();
          setContent(data.results?.[0] || data);
        } else {
          throw new Error(`Failed to fetch VCP content: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error('Error fetching VCP content:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVCPContent();
  }, [vcpId]);

  if (loading) {
    return (
      <div className="vcp-loader">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Builder.io content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vcp-error">
        <h2>Error Loading Content</h2>
        <p>{error}</p>
        <details>
          <summary>VCP Details</summary>
          <p>VCP ID: {vcpId}</p>
          <p>Space ID: {BUILDER_API_KEY}</p>
        </details>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="vcp-not-found">
        <h2>Content Not Found</h2>
        <p>The requested VCP content could not be found.</p>
        <p>VCP ID: {vcpId}</p>
      </div>
    );
  }

  // Render the content data
  return (
    <div className="vcp-content">
      <div className="vcp-header">
        <h1>Builder.io VCP Content</h1>
        <p>ID: {vcpId}</p>
      </div>
      
      {content.data && (
        <div className="vcp-data">
          <h2>Content Data:</h2>
          <pre className="content-json">
            {JSON.stringify(content.data, null, 2)}
          </pre>
        </div>
      )}
      
      {content.html && (
        <div className="vcp-html">
          <h2>Generated HTML:</h2>
          <div 
            className="html-content"
            dangerouslySetInnerHTML={{ __html: content.html }}
          />
        </div>
      )}
      
      {/* Display blocks if available */}
      {content.data?.blocks && (
        <div className="vcp-blocks">
          <h2>Builder Blocks:</h2>
          <div className="blocks-container">
            {content.data.blocks.map((block, index) => (
              <div key={index} className="block-item">
                <h3>Block {index + 1}: {block.component?.name || 'Unknown'}</h3>
                <pre>{JSON.stringify(block, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="vcp-raw">
        <details>
          <summary>Raw Content Data</summary>
          <pre className="raw-json">
            {JSON.stringify(content, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
