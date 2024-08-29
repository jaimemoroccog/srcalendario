// src/components/LinkPreviewTest.jsx
import React from 'react';

const LinkPreviewTest = ({ url }) => (
  <div className="link-preview">
    <a href={url} target="_blank" rel="noopener noreferrer">
      {url}
    </a>
  </div>
);

export default LinkPreviewTest;
