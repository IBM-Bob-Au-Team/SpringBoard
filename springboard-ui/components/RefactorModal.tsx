'use client';

import { useState } from 'react';

interface RefactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoUrl: string;
  repoName: string;
  onSuccess: (data: RefactorSuccessData) => void;
}

export interface RefactorSuccessData {
  branch: string;
  branchUrl: string;
  prUrl: string;
  message: string;
  filesRefactored?: number;
  changes?: Array<{ file: string; change: string }>;
}

type RefactorStep = 
  | 'idle'
  | 'fetching'
  | 'ai-processing'
  | 'refactoring-pom'
  | 'refactoring-java'
  | 'refactoring-docker'
  | 'pushing'
  | 'creating-pr';

export default function RefactorModal({ isOpen, onClose, repoUrl, repoName, onSuccess }: RefactorModalProps) {
  const [githubToken, setGithubToken] = useState('');
  const [watsonxApiKey, setWatsonxApiKey] = useState('');
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showWatsonxKey, setShowWatsonxKey] = useState(false);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<RefactorStep>('idle');
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const steps: Array<{ key: RefactorStep; label: string }> = [
    { key: 'fetching', label: 'Fetching repository files' },
    { key: 'ai-processing', label: 'Sending to IBM Granite AI' },
    { key: 'refactoring-pom', label: 'Modernizing pom.xml' },
    { key: 'refactoring-java', label: 'Migrating Java files' },
    { key: 'refactoring-docker', label: 'Updating Dockerfile' },
    { key: 'pushing', label: 'Pushing to repository' },
    { key: 'creating-pr', label: 'Creating pull request' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsRefactoring(true);
    setProgress(0);

    try {
      // Step 1: Fetching files
      setCurrentStep('fetching');
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: AI Processing
      setCurrentStep('ai-processing');
      setProgress(20);

      const response = await fetch('/api/ai-refactor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl,
          githubToken: githubToken.trim(),
          watsonxApiKey: watsonxApiKey.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to refactor code');
        setIsRefactoring(false);
        setCurrentStep('idle');
        setProgress(0);
        return;
      }

      // Simulate progress through steps
      setCurrentStep('refactoring-pom');
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentStep('refactoring-java');
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentStep('refactoring-docker');
      setProgress(75);
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentStep('pushing');
      setProgress(85);
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentStep('creating-pr');
      setProgress(95);
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(100);

      // Clear tokens from memory
      setGithubToken('');
      setWatsonxApiKey('');
      
      // Call success callback
      onSuccess(data);
      
      // Close modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsRefactoring(false);
      setCurrentStep('idle');
      setProgress(0);
    }
  };

  const handleClose = () => {
    if (!isRefactoring) {
      setGithubToken('');
      setWatsonxApiKey('');
      setError('');
      setCurrentStep('idle');
      setProgress(0);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">AI-Powered Refactoring</h2>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                  Powered by IBM Granite
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isRefactoring}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Explanation */}
          <div className="space-y-3">
            <p className="text-gray-300 leading-relaxed">
              IBM watsonx.ai will analyze your Spring Boot 2 code using the Granite model and generate 
              a fully modernized Spring Boot 3 version with all necessary updates.
            </p>
          </div>

          {/* What it will do */}
          <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">What IBM Granite will do:</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Upgrade to Spring Boot 3.1.5</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Migrate javax.* to jakarta.*</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Update to Java 17</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Fix deprecated APIs and annotations</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Update Dockerfile for Java 17</span>
              </div>
            </div>
          </div>

          {/* Repository Info */}
          <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Target Repository</div>
            <div className="font-mono text-primary">{repoName}</div>
          </div>

          {/* GitHub Token Input */}
          <div className="space-y-2">
            <label htmlFor="githubToken" className="block text-sm font-medium text-gray-300">
              GitHub Personal Access Token *
            </label>
            <div className="relative">
              <input
                id="githubToken"
                type={showGithubToken ? 'text' : 'password'}
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                required
                disabled={isRefactoring}
                className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors disabled:opacity-50 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowGithubToken(!showGithubToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showGithubToken ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Required for pushing refactored code</span>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=SpringBoard%20AI%20Refactoring"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Create token →
              </a>
            </div>
          </div>

          {/* Watsonx API Key Input (Optional) */}
          <div className="space-y-2">
            <label htmlFor="watsonxApiKey" className="block text-sm font-medium text-gray-300">
              Watsonx.ai API Key (Optional)
            </label>
            <div className="relative">
              <input
                id="watsonxApiKey"
                type={showWatsonxKey ? 'text' : 'password'}
                value={watsonxApiKey}
                onChange={(e) => setWatsonxApiKey(e.target.value)}
                placeholder="Leave empty to use demo quota"
                disabled={isRefactoring}
                className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowWatsonxKey(!showWatsonxKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showWatsonxKey ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Or provide your own watsonx.ai API key for unlimited usage
            </p>
          </div>

          {/* Progress UI */}
          {isRefactoring && (
            <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Refactoring in progress...</span>
                <span className="text-sm text-primary font-semibold">{progress}%</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-purple-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Steps */}
              <div className="space-y-2 mt-4">
                {steps.map((step, index) => {
                  const isActive = step.key === currentStep;
                  const isComplete = steps.findIndex(s => s.key === currentStep) > index;
                  
                  return (
                    <div
                      key={step.key}
                      className={`flex items-center space-x-3 text-sm ${
                        isActive ? 'text-primary' : isComplete ? 'text-green-400' : 'text-gray-500'
                      }`}
                    >
                      {isComplete ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isActive ? (
                        <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-700" />
                      )}
                      <span>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Security Notice */}
          {!isRefactoring && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="text-sm text-blue-300 leading-relaxed">
                  Your tokens are sent over HTTPS and used only for this request. 
                  They are never stored, logged, or reused. The AI refactoring process typically takes 30-60 seconds.
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          {!isRefactoring && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-yellow-300 leading-relaxed">
                  This will create a new branch called <code className="px-1.5 py-0.5 bg-yellow-500/20 rounded text-yellow-200 font-mono text-xs">springboard-modernized</code> with 
                  AI-refactored code. Your original code is never modified.
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-red-300">{error}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          {!isRefactoring && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!githubToken}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Refactor with IBM AI</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Made with Bob
