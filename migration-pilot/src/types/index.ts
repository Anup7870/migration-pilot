export type StepStatus = 'pending' | 'active' | 'completed' | 'failed' | 'healed';

export interface PipelineStep {
  id: number;
  title: string;
  subtitle: string;
  engine: string;
  status: StepStatus;
  progress: number;
  duration?: string;
  details?: string;
}

export type LogLevel = 'info' | 'warn' | 'success' | 'ast' | 'llama' | 'muse' | 'tsc' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  prefix: string;
  message: string;
  file?: string;
}

export type FileStatus = 'queued' | 'migrating' | 'passed' | 'healed';

export interface BackendFilePayload {
  original_path: string;
  migrated_path: string;
  original_code: string;
  migrated_code: string;
  summary?: string;
}

export interface StreamEventPayload {
  stage: 1 | 2 | 3 | 4 | 5;
  status: 'running' | 'passed' | 'failed';
  message: string;
  duration?: string;
  files?: BackendFilePayload[] | any;
}

export interface VerifyMigrationRequest {
  legacy_code: string;
  migrated_code: string;
  test_code: string;
}

export interface SandboxResults {
  passed: boolean;
  exit_code?: number;
  logs?: string;
  [key: string]: any;
}

export interface VerifyMigrationResponse {
  status: string;
  sandbox_results: SandboxResults;
}

export interface FileItem {
  id: string;
  name: string;
  path: string;
  originalExt: string;
  targetExt: string;
  status: FileStatus;
  category: 'component' | 'hook' | 'util' | 'config' | 'context';
  stats: {
    added: number;
    removed: number;
    typeErrors: number;
    coverage: number;
  };
  originalCode: string;
  migratedCode: string;
  astSymbols: string[];
  dependencies: string[];
  healedReasons?: string[];
  typeInferenceNotes?: string[];
}

export interface DependencyItem {
  name: string;
  currentVersion: string;
  typesPackage?: string;
  typesInstalled: boolean;
  category: 'production' | 'dev' | 'ambient';
}

export interface DomBinding {
  selector: string;
  type: string;
  occurrences: number;
  inferredType: string;
}

export interface BlueprintStrategy {
  targetTsConfig: string;
  strictnessLevel: 'strict' | 'lenient' | 'progressive';
  jsxRuntime: 'react-jsx' | 'classic';
  totalJsFiles: number;
  totalTsGenerated: number;
  typeSafetyConfidence: number;
  astPasses: number;
}
