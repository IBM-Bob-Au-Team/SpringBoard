'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function Home() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  // SECURITY: Validate GitHub URL format
  const validateGitHubUrl = (url: string): boolean => {
    if (!url) {
      setUrlError('Please enter a GitHub repository URL');
      return false;
    }

    const trimmed = url.trim();

    // Must be a github.com URL
    if (!trimmed.startsWith('https://github.com/')) {
      setUrlError('Invalid URL. Must be a GitHub repository URL starting with https://github.com/');
      return false;
    }

    // Basic structure validation
    const path = trimmed.replace('https://github.com/', '');
    const parts = path.split('/');

    if (parts.length < 2 || !parts[0] || !parts[1]) {
      setUrlError('Invalid GitHub URL format. Expected: https://github.com/owner/repository');
      return false;
    }

    setUrlError('');
    return true;
  };

  const handleAnalyze = async () => {
    // SECURITY: Validate URL before submission
    if (!validateGitHubUrl(repoUrl)) {
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          token: token.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if token is needed
        if (data.needsToken) {
          setShowTokenInput(true);
          setError('This repository requires a GitHub token. Please provide one below.');
          return;
        }
        setError(data.error || 'Failed to analyze repository');
        return;
      }

      // Success - redirect to reports page with URL params
      const repoName = data.repoName || 'repository';
      router.push(`/reports?repoUrl=${encodeURIComponent(repoUrl.trim())}&repoName=${encodeURIComponent(repoName)}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col">
      <Navigation />

      {/* Hero Section with Analyzer as Main Focus */}
      <section className="relative overflow-hidden flex-1 flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto px-6 py-16 relative w-full">
          <div className="text-center space-y-8 mb-12">
            <div className="inline-block">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium">
                🚀 AI-Powered Spring Boot Migration
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Modernize Spring Boot 2 to 3,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                Faster with IBM Bob
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Paste your GitHub repository URL below to get instant analysis and modernization recommendations
            </p>
          </div>

          {/* Main Analyzer Card */}
          <div className="bg-[#1a1a1a] border-2 border-primary/30 rounded-2xl p-8 md:p-12 shadow-2xl shadow-primary/10">
            <div className="space-y-6">
              {/* GitHub URL Input */}
              <div>
                <label htmlFor="repoUrl" className="block text-lg font-semibold text-white mb-3">
                  GitHub Repository URL
                </label>
                <input
                  id="repoUrl"
                  type="text"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                    setUrlError('');
                    setError('');
                  }}
                  onBlur={() => {
                    if (repoUrl) validateGitHubUrl(repoUrl);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isAnalyzing) {
                      handleAnalyze();
                    }
                  }}
                  placeholder="https://github.com/owner/repository"
                  className="w-full px-6 py-4 bg-[#161616] border-2 border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  disabled={isAnalyzing}
                />
                {urlError && (
                  <div className="mt-3 text-sm text-red-400 flex items-start space-x-2">
                    <span>⚠️</span>
                    <span>{urlError}</span>
                  </div>
                )}
              </div>

              {/* Token Input (shown only when needed) */}
              {showTokenInput && (
                <div className="animate-fadeIn">
                  <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub Personal Access Token
                  </label>
                  <input
                    id="token"
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full px-4 py-3 bg-[#161616] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    disabled={isAnalyzing}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Your token is only used for this request and is never stored
                  </p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !repoUrl}
                className="w-full px-8 py-5 bg-primary hover:bg-primary/90 text-white text-lg font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center space-x-3">
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing Repository...</span>
                  </span>
                ) : (
                  'Analyze Repository'
                )}
              </button>

              {/* Info Text */}
              <div className="text-sm text-center text-gray-400 space-y-2 pt-4">
                <p className="flex items-center justify-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Works with public repositories</span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Private repos require GitHub token</span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Your token is never stored or logged</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-12 text-center space-y-4">
            <p className="text-gray-400">Want to see how it works first?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/demo"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all"
              >
                View Demo
              </a>
              <a
                href="/team"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all"
              >
                Meet the Team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-t border-gray-800 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">6</div>
              <div className="text-sm text-gray-400">Java Files Refactored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">2.x → 3.1.5</div>
              <div className="text-sm text-gray-400">Spring Boot Upgrade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">11 → 17</div>
              <div className="text-sm text-gray-400">Java Version</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">⚡</div>
              <div className="text-sm text-gray-400">Powered by IBM Bob</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Made with Bob
