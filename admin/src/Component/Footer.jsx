// src/components/Footer.jsx
import React from 'react';

const Footer = () => (
  <footer className="bg-gray-800 text-center text-sm text-gray-400 py-4">
    <p>
      Follow us on
      <a
        href="https://instagram.com/yourprofile"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:underline ml-1"
      >
        Instagram
      </a>{' '}
      | Email:{' '}
      <a
        href="mailto:info@cybknow.com"
        className="text-blue-400 hover:underline ml-1"
      >
        info@cybknow.com
      </a>{' '}
      |{' '}
      <a
        href="https://cybknow.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:underline ml-1"
      >
        Official Site
      </a>{' '}
      | Phone: <span className="ml-1">+91 9078558087</span>
    </p>
  </footer>
);

export default Footer;
