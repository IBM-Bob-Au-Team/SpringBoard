'use client';

import { useState, useEffect } from 'react';

interface TokenInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function TokenInput({
  value,
  onChange,
  label = 'GitHub Personal Access Token',
  placeholder = 'ghp_xxxxxxxxxxxx',
  required = false,
}: TokenInputProps) {
  const [showToken, setShowToken] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [validationError, setValidationError] = useState('');

  // SECURITY: Clear token on component unmount
  useEffect(() => {
    return () => {
      // Cleanup: clear token from memory when component unmounts
      onChange('');
    };
  }, []);

  // Validate token format
  const validateTokenFormat = (token: string): boolean => {
    if (!token) return true; // Empty is valid (optional field)
    
    // Valid GitHub token formats:
    // - ghp_ (Personal Access Token)
    // - github_pat_ (Fine-grained Personal Access Token)
    const validPrefixes = ['ghp_', 'github_pat_'];
    const hasValidPrefix = validPrefixes.some(prefix => token.startsWith(prefix));
    
    if (!hasValidPrefix) {
      setValidationError('This does not look like a valid GitHub token. Personal access tokens start with ghp_');
      return false;
    }
    
    setValidationError('');
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Validate on change
    if (newValue) {
      validateTokenFormat(newValue);
    } else {
      setValidationError('');
    }
  };

  const toggleShowToken = () => {
    setShowToken(!showToken);
  };

  return (
    <div className="space-y-4">
      {/* Header with lock icon */}
      <div className="flex items-center space-x-2 mb-2">
        <div className="text-2xl">🔒</div>
        <h3 className="text-lg font-semibold text-white">Secure GitHub Access</h3>
      </div>

      {/* Explanation */}
      <p className="text-sm text-gray-400">
        We need access to your GitHub repository to analyze your Spring Boot project. 
        Your token is used only for this analysis and is never stored.
      </p>

      {/* Link to GitHub docs */}
      <div className="text-sm">
        <span className="text-gray-400">Don't have a token? </span>
        <a
          href="https://github.com/settings/tokens/new?scopes=repo&description=SpringBoard%20Analysis"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Create one on GitHub →
        </a>
      </div>

      {/* Token input with show/hide toggle */}
      <div>
        <label htmlFor="github-token" className="block text-sm font-medium text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <div className="relative">
          {/* SECURITY: type="password" to mask token by default */}
          <input
            id="github-token"
            type={showToken ? 'text' : 'password'}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full px-4 py-3 pr-12 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            autoComplete="off"
            spellCheck="false"
          />
          
          {/* Show/hide toggle button */}
          <button
            type="button"
            onClick={toggleShowToken}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            aria-label={showToken ? 'Hide token' : 'Show token'}
          >
            {showToken ? (
              // Eye slash icon (hidden)
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              // Eye icon (visible)
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="mt-2 text-sm text-red-400 flex items-start space-x-2">
            <span>⚠️</span>
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Security notice */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          🔒 <strong>Security:</strong> Your token is sent directly to our secure API and never stored or logged. 
          It exists only in memory during the analysis.
        </p>
      </div>

      {/* Permissions expandable section */}
      <div className="border border-gray-800 rounded-lg">
        <button
          type="button"
          onClick={() => setShowPermissions(!showPermissions)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors rounded-lg"
        >
          <span className="text-sm font-medium text-gray-300">
            What permissions do I need?
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${showPermissions ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showPermissions && (
          <div className="px-4 pb-4 space-y-3 text-sm">
            <div className="border-t border-gray-800 pt-3">
              <div className="flex items-start space-x-2 mb-2">
                <span className="text-green-400">✓</span>
                <div>
                  <div className="font-medium text-white">For Analysis (View Report)</div>
                  <div className="text-gray-400 mt-1">
                    <strong>repo (read)</strong> - Read access to repository contents
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Allows SpringBoard to read your pom.xml and analyze your project
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="text-yellow-400">⚠️</span>
                <div>
                  <div className="font-medium text-white">For Refactoring (Code Changes)</div>
                  <div className="text-gray-400 mt-1">
                    <strong>repo (write)</strong> - Write access to create branches and commits
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Required to create the modernized branch and push refactored code
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded p-2 text-xs text-gray-400">
              💡 <strong>Tip:</strong> You can create a token with only read access for analysis, 
              then create a separate token with write access when you're ready to refactor.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob