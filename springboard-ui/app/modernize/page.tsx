'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import type { RefactorResponse } from '@/lib/types';

function ModernizePageContent() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get('repoUrl') || '';
  const repoName = searchParams.get('repoName') || '';
  
  const [token, setToken] = useState('');
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [refactorResult, setRefactorResult] = useState<RefactorResponse | null>(null);
  const [error, setError] = useState('');

  const handleViewReport = () => {
    window.location.href = `/reports?repoUrl=${encodeURIComponent(repoUrl)}&repoName=${encodeURIComponent(repoName)}`;
  };

  const handleStartRefactoring = async () => {
    if (!token.trim()) {
      setError('Please enter your GitHub Personal Access Token');
      return;
    }

    setIsRefactoring(true);
    setError('');
    setRefactorResult(null);

    try {
      const response = await fetch('/api/refactor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl,
          token: token.trim(),
        }),
      });

      const data: RefactorResponse = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to start refactoring');
        return;
      }

      setRefactorResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsRefactoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Choose Your Modernization Path
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Select how you want to modernize your Spring Boot application
            </p>
            {repoName && (
              <div className="inline-block bg-primary/20 border border-primary/30 rounded-lg px-4 py-2">
                <span className="text-primary font-semibold">Repository: {repoName}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Options Section */}
      <section className="py-12 bg-[#161616]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Option 1 - View Analysis Only */}
            <div className="bg-[#1a1a1a] border-2 border-blue-500/50 rounded-2xl p-8 hover:border-blue-500 transition-all">
              <div className="mb-4">
                <span className="inline-block bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1 text-xs font-semibold text-blue-400">
                  Free - No login required
                </span>
              </div>
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-3">View Analysis Report</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                See the full analysis of your Spring Boot project with all issues, risks and recommendations
              </p>
              <button
                onClick={handleViewReport}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                View Report
              </button>
            </div>

            {/* Option 2 - Refactor Code */}
            <div className="bg-[#1a1a1a] border-2 border-purple-500/50 rounded-2xl p-8 hover:border-purple-500 transition-all">
              <div className="mb-4">
                <span className="inline-block bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1 text-xs font-semibold text-purple-400">
                  Requires GitHub Token
                </span>
              </div>
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-2xl font-bold mb-3">Refactor My Code</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                IBM Bob will analyze your code and generate a modernized version with Spring Boot 3, Java 17, and updated dependencies
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub Personal Access Token
                  </label>
                  <input
                    id="token"
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full px-4 py-3 bg-[#161616] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    disabled={isRefactoring}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Need write access to push changes to your repo.{' '}
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline"
                    >
                      Create token
                    </a>
                  </p>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
                  <p className="text-xs text-yellow-400">
                    ⚠️ This will create a new branch called <span className="font-mono font-semibold">springboard-modernized</span> in your repository
                  </p>
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {refactorResult && refactorResult.success && (
                  <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
                    <p className="text-sm text-green-400 font-semibold mb-2">✓ {refactorResult.message}</p>
                    <p className="text-xs text-gray-400">
                      Branch: <span className="font-mono text-green-400">{refactorResult.branch}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Status: <span className="text-green-400">{refactorResult.status}</span>
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleStartRefactoring}
                disabled={isRefactoring}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRefactoring ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Starting Refactoring...</span>
                  </span>
                ) : (
                  'Start Refactoring'
                )}
              </button>
            </div>

            {/* Option 3 - Full Auto Pipeline */}
            <div className="bg-[#1a1a1a] border-2 border-yellow-500/50 rounded-2xl p-8 hover:border-yellow-500 transition-all opacity-75">
              <div className="mb-4">
                <span className="inline-block bg-yellow-500/20 border border-yellow-500/30 rounded-full px-3 py-1 text-xs font-semibold text-yellow-400">
                  Powered by watsonx Orchestrate
                </span>
              </div>
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-3">Full Auto Modernization</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Connect watsonx Orchestrate to run a complete automated pipeline: analyze, refactor, test, and create a Pull Request in your repository automatically
              </p>

              <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-400">
                  💡 This feature uses IBM watsonx Orchestrate to orchestrate the full modernization pipeline
                </p>
              </div>

              <button
                disabled
                className="w-full px-6 py-3 bg-gray-700 text-gray-400 font-semibold rounded-lg cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">What happens during refactoring?</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-3">
                <span className="text-primary text-xl">1.</span>
                <span>IBM Bob analyzes your entire Spring Boot 2 codebase</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary text-xl">2.</span>
                <span>Creates a new branch called <span className="font-mono bg-[#161616] px-2 py-1 rounded">springboard-modernized</span></span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary text-xl">3.</span>
                <span>Updates pom.xml to Spring Boot 3.1.5 and Java 17</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary text-xl">4.</span>
                <span>Migrates javax.* imports to jakarta.*</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary text-xl">5.</span>
                <span>Updates deprecated APIs and configurations</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary text-xl">6.</span>
                <span>Generates comprehensive documentation and test reports</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function ModernizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#161616] text-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <svg className="animate-spin h-12 w-12 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl text-gray-400">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <ModernizePageContent />
    </Suspense>
  );
}

// Made with Bob