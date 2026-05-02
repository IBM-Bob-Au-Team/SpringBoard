import type { AnalysisResult } from '@/lib/types';

interface AnalysisResultProps {
  result: AnalysisResult;
  onStartMigration?: () => void;
  onViewReport?: () => void;
}

/**
 * SECURITY: This component NEVER displays any token information
 * - No token values shown anywhere
 * - When proceeding to refactoring, user must provide token again (never cached)
 * - All sensitive data is excluded from display
 */
export default function AnalysisResult({ result, onStartMigration, onViewReport }: AnalysisResultProps) {
  // Error state - repo not accessible
  if (!result.accessible) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-900/20 border-2 border-red-500 rounded-2xl p-8">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">🔒</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-red-400 mb-2">Repository Not Accessible</h3>
              <p className="text-gray-300 mb-4">{result.error}</p>
              <div className="bg-[#161616] border border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">
                  <strong>Repository:</strong> {result.repoName}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  If this is a private repository, please provide a GitHub personal access token with repo access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Warning state - not a Spring Boot project
  if (result.error && result.error.includes('pom.xml')) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-yellow-900/20 border-2 border-yellow-500 rounded-2xl p-8">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-yellow-400 mb-2">Not a Spring Boot Project</h3>
              <p className="text-gray-300 mb-4">{result.error}</p>
              <div className="bg-[#161616] border border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">
                  <strong>Repository:</strong> {result.repoName}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  <strong>URL:</strong>{' '}
                  <a href={result.repoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {result.repoUrl}
                  </a>
                </p>
                {result.repoDescription && (
                  <p className="text-sm text-gray-400 mt-2">
                    <strong>Description:</strong> {result.repoDescription}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-4">{result.recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - analysis complete
  const isSpringBoot2 = result.springBootVersion?.startsWith('2.');
  const isOldJava = result.javaVersion && parseFloat(result.javaVersion) < 17;

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-3xl">📊</span>
              <h2 className="text-3xl font-bold text-white">{result.repoName}</h2>
            </div>
            {result.repoDescription && (
              <p className="text-gray-400 mb-4">{result.repoDescription}</p>
            )}
            <a 
              href={result.repoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              {result.repoUrl} →
            </a>
          </div>
          {result.needsMigration && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg px-4 py-2">
              <span className="text-red-400 font-semibold text-sm">Migration Required</span>
            </div>
          )}
        </div>

        {/* Version Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#161616] border border-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Spring Boot Version</div>
            <div className={`text-2xl font-bold ${isSpringBoot2 ? 'text-red-400' : 'text-green-400'}`}>
              {result.springBootVersion || 'Unknown'}
            </div>
            {isSpringBoot2 && (
              <div className="text-xs text-red-400 mt-1">⚠️ Outdated - Upgrade Required</div>
            )}
          </div>
          <div className="bg-[#161616] border border-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Java Version</div>
            <div className={`text-2xl font-bold ${isOldJava ? 'text-yellow-400' : 'text-green-400'}`}>
              {result.javaVersion || 'Unknown'}
            </div>
            {isOldJava && (
              <div className="text-xs text-yellow-400 mt-1">⚠️ Below Java 17</div>
            )}
          </div>
        </div>
      </div>

      {/* Issues Card */}
      {result.issues.length > 0 && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <span>🔍</span>
            <span>Issues Found</span>
          </h3>
          <ul className="space-y-3">
            {result.issues.map((issue, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="text-red-400 mt-1">•</span>
                <span className="text-gray-300 flex-1">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dependencies Card */}
      {result.dependencies && result.dependencies.length > 0 && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <span>📦</span>
            <span>Key Dependencies</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {result.dependencies.slice(0, 12).map((dep, index) => (
              <div key={index} className="bg-[#161616] border border-gray-700 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-300 font-mono">{dep}</span>
              </div>
            ))}
          </div>
          {result.dependencies.length > 12 && (
            <p className="text-sm text-gray-400 mt-4">
              + {result.dependencies.length - 12} more dependencies
            </p>
          )}
        </div>
      )}

      {/* Recommendation Card */}
      <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 rounded-2xl p-8">
        <h3 className="text-2xl font-bold mb-4 flex items-center space-x-2">
          <span>💡</span>
          <span>Recommendation</span>
        </h3>
        <p className="text-gray-300 leading-relaxed mb-6">{result.recommendation}</p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onViewReport}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all"
          >
            View Full Report
          </button>
          {result.needsMigration && (
            <div className="flex-1">
              <button
                onClick={onStartMigration}
                className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25"
              >
                Start Modernization
              </button>
              {/* SECURITY: Inform user they'll need to provide token again */}
              <p className="text-xs text-gray-500 mt-2 text-center">
                🔒 You'll be asked for your GitHub token again for security
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
