// Type definitions for SpringBoard GitHub analyzer

export interface AnalyzeRequest {
  repoUrl: string;
  token?: string;
}

export interface AnalysisResult {
  accessible: boolean;
  repoName: string;
  repoUrl: string;
  repoDescription?: string;
  springBootVersion?: string;
  javaVersion?: string;
  dependencies?: string[];
  needsMigration: boolean;
  issues: string[];
  recommendation: string;
  error?: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  private: boolean;
  default_branch: string;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export interface PomDependency {
  groupId: string;
  artifactId: string;
  version?: string;
}

// Made with Bob
