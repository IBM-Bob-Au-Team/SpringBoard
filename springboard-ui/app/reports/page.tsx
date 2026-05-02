'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import type { AnalysisResult } from '@/lib/types';

interface StoredReport {
  id: string;
  repoUrl: string;
  repoName: string;
  timestamp: number;
  data: AnalysisResult;
}

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [recentReports, setRecentReports] = useState<StoredReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showingReport, setShowingReport] = useState(false);

  const repoUrl = searchParams.get('repoUrl');
  const repoName = searchParams.get('repoName');

  // Load recent reports from localStorage
  useEffect(() => {
    const loadRecentReports = () => {
      try {
        const stored = localStorage.getItem('springboard_reports');
        if (stored) {
          const reports: StoredReport[] = JSON.parse(stored);
          setRecentReports(reports.slice(0, 5)); // Keep only 5 most recent
        }
      } catch (err) {
        console.error('Failed to load recent reports:', err);
      }
    };

    loadRecentReports();
  }, []);

  // Fetch analysis data if URL params are provided
  useEffect(() => {
    if (!repoUrl || !repoName) {
      return;
    }

    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError('');
      setShowingReport(true);

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            repoUrl: repoUrl,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch analysis data');
          return;
        }

        setAnalysisData(data);

        // Save to localStorage
        saveReport(repoUrl, repoName, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [repoUrl, repoName]);

  const saveReport = (url: string, name: string, data: AnalysisResult) => {
    try {
      const stored = localStorage.getItem('springboard_reports');
      let reports: StoredReport[] = stored ? JSON.parse(stored) : [];

      // Remove duplicate if exists
      reports = reports.filter(r => r.repoUrl !== url);

      // Add new report at the beginning
      const newReport: StoredReport = {
        id: Date.now().toString(),
        repoUrl: url,
        repoName: name,
        timestamp: Date.now(),
        data: data,
      };

      reports.unshift(newReport);

      // Keep only 5 most recent
      reports = reports.slice(0, 5);

      localStorage.setItem('springboard_reports', JSON.stringify(reports));
      setRecentReports(reports);
    } catch (err) {
      console.error('Failed to save report:', err);
    }
  };

  const loadReport = (report: StoredReport) => {
    setAnalysisData(report.data);
    setShowingReport(true);
    setError('');
    // Update URL without reload
    window.history.pushState({}, '', `/reports?repoUrl=${encodeURIComponent(report.repoUrl)}&repoName=${encodeURIComponent(report.repoName)}`);
  };

  const deleteReport = (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = recentReports.filter(r => r.id !== reportId);
      localStorage.setItem('springboard_reports', JSON.stringify(updated));
      setRecentReports(updated);
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const clearAllReports = () => {
    try {
      localStorage.removeItem('springboard_reports');
      setRecentReports([]);
    } catch (err) {
      console.error('Failed to clear reports:', err);
    }
  };

  const backToReports = () => {
    setShowingReport(false);
    setAnalysisData(null);
    setError('');
    window.history.pushState({}, '', '/reports');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#161616] text-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <svg className="animate-spin h-12 w-12 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl text-gray-400">Analyzing repository...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error && showingReport) {
    return (
      <div className="min-h-screen bg-[#161616] text-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-6 text-center space-y-6">
            <div className="text-6xl">⚠️</div>
            <h1 className="text-3xl font-bold">Analysis Failed</h1>
            <p className="text-xl text-gray-400">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={backToReports}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all"
              >
                Back to Reports
              </button>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all"
              >
                Try Another Repository
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show individual report
  if (showingReport && analysisData) {
    const springBootBefore = analysisData.springBootVersion || '2.x';
    const springBootAfter = '3.1.5';
    const javaBefore = analysisData.javaVersion || '11';
    const javaAfter = '17';

    return (
      <div className="min-h-screen bg-[#161616] text-white">
        <Navigation />

        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Back Button */}
          <button
            onClick={backToReports}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Reports</span>
          </button>

          {/* Title Section */}
          <div className="mb-12">
            <div className="inline-block px-4 py-2 bg-primary/20 border border-primary/30 rounded-full text-primary text-sm font-medium mb-4">
              📊 Analysis Complete
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {repoName}
            </h1>
            <p className="text-xl text-gray-400">
              {analysisData.repoDescription || 'Spring Boot Application Analysis'}
            </p>
            <a
              href={analysisData.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors mt-4"
            >
              <span className="text-sm">View on GitHub</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <p className="text-sm text-gray-500 mt-2">
              Report Date: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 hover:border-primary/50 transition-all">
              <div className="text-4xl font-bold text-primary mb-2">
                {analysisData.needsMigration ? '⚠️' : '✓'}
              </div>
              <div className="text-sm text-gray-400">Migration Status</div>
              <div className="mt-3 text-xs text-gray-500">
                {analysisData.needsMigration ? 'Needs Modernization' : 'Up to Date'}
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 hover:border-primary/50 transition-all">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {analysisData.issues?.length || 0}
              </div>
              <div className="text-sm text-gray-400">Issues Detected</div>
              <div className="mt-3 text-xs text-gray-500">
                Requires attention
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 hover:border-primary/50 transition-all">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {analysisData.dependencies?.length || 0}
              </div>
              <div className="text-sm text-gray-400">Dependencies</div>
              <div className="mt-3 text-xs text-gray-500">
                Maven dependencies found
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 hover:border-primary/50 transition-all">
              <div className="text-2xl font-bold text-white mb-2">
                {springBootBefore} → {springBootAfter}
              </div>
              <div className="text-sm text-gray-400">Spring Boot</div>
              <div className="mt-3 text-xs text-gray-500">
                {analysisData.needsMigration ? 'Upgrade available' : 'Current version'}
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Technology Stack</h2>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0d1117] border-b border-gray-800">
                    <tr>
                      <th className="text-left px-6 py-4 text-gray-400 font-semibold">Category</th>
                      <th className="text-left px-6 py-4 text-gray-400 font-semibold">Current</th>
                      <th className="text-left px-6 py-4 text-gray-400 font-semibold">Recommended</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-gray-800 hover:bg-[#1f1f1f] transition-colors">
                      <td className="px-6 py-4 font-medium">Spring Boot Version</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          analysisData.needsMigration 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {springBootBefore}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                          {springBootAfter}
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800 hover:bg-[#1f1f1f] transition-colors">
                      <td className="px-6 py-4 font-medium">Java Version</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          parseInt(javaBefore) < 17
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {javaBefore}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                          {javaAfter}
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800 hover:bg-[#1f1f1f] transition-colors">
                      <td className="px-6 py-4 font-medium">Package Namespace</td>
                      <td className="px-6 py-4">
                        <code className="text-sm text-gray-400">javax.*</code>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm text-primary">jakarta.*</code>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#1f1f1f] transition-colors">
                      <td className="px-6 py-4 font-medium">Repository Status</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400">
                          {analysisData.isPrivate ? 'Private' : 'Public'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-primary">Accessible</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Issues Detected */}
          {analysisData.issues && analysisData.issues.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Issues Detected</h2>
              <div className="space-y-3">
                {analysisData.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-yellow-500 text-xl mt-1">⚠️</span>
                      <div className="flex-1">
                        <p className="text-gray-300">{issue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {analysisData.dependencies && analysisData.dependencies.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Dependencies</h2>
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisData.dependencies.slice(0, 10).map((dep, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 text-sm"
                    >
                      <span className="text-primary">•</span>
                      <code className="text-gray-300">{dep}</code>
                    </div>
                  ))}
                </div>
                {analysisData.dependencies.length > 10 && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    And {analysisData.dependencies.length - 10} more dependencies...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Recommendation</h2>
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 rounded-2xl p-8">
              <p className="text-lg text-gray-300 leading-relaxed">
                {analysisData.recommendation}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <a
              href="/"
              className="inline-block px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25"
            >
              Analyze Another Repository
            </a>
            <p className="text-sm text-gray-500">
              Want to see how we modernized our own app?{' '}
              <a href="/demo" className="text-primary hover:text-primary/80">
                View Demo
              </a>
            </p>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Show recent reports list (default view)
  return (
    <div className="min-h-screen bg-[#161616] text-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-primary/20 border border-primary/30 rounded-full text-primary text-sm font-medium mb-4">
            📊 Analysis Reports
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Recent Reports
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            View your recent repository analyses. Reports are stored locally in your browser.
          </p>
        </div>

        {/* Recent Reports */}
        {recentReports.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Reports ({recentReports.length}/5)</h2>
              <button
                onClick={clearAllReports}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            </div>

            {recentReports.map((report) => (
              <div
                key={report.id}
                onClick={() => loadReport(report)}
                className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {report.repoName}
                      </h3>
                      {report.data.needsMigration ? (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                          Needs Migration
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          Up to Date
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      {report.data.repoDescription || 'No description'}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>Spring Boot: {report.data.springBootVersion || 'N/A'}</span>
                      <span>•</span>
                      <span>Java: {report.data.javaVersion || 'N/A'}</span>
                      <span>•</span>
                      <span>{report.data.issues?.length || 0} issues</span>
                      <span>•</span>
                      <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteReport(report.id, e)}
                    className="ml-4 p-2 text-gray-500 hover:text-red-400 transition-colors"
                    title="Delete report"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-3xl font-bold">No Recent Reports Found</h2>
            <p className="text-xl text-gray-400">
              You haven't analyzed any repositories yet. Start by analyzing your first Spring Boot project!
            </p>
            <a
              href="/"
              className="inline-block px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25"
            >
              Analyze a Repository
            </a>
            <p className="text-sm text-gray-500">
              Want to see an example first?{' '}
              <a href="/demo" className="text-primary hover:text-primary/80">
                View Demo
              </a>
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// Made with Bob
