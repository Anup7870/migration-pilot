import { FileItem, DependencyItem, DomBinding, BlueprintStrategy, PipelineStep, LogEntry } from '../types';

export const INITIAL_STEPS: PipelineStep[] = [
  {
    id: 1,
    title: 'Repository Ingestion',
    subtitle: 'Cloning tree & unzipping files',
    engine: 'Git Native Tree Parser',
    status: 'pending',
    progress: 0,
    duration: '0.8s',
    details: 'Cloning tree structure, extracting .zip payloads, and filtering JavaScript/JSX targets.'
  },
  {
    id: 2,
    title: 'Structural & Dependency Analysis',
    subtitle: 'AST symbols & DOM bindings',
    engine: 'Babel / SWC AST Walker',
    status: 'pending',
    progress: 0,
    duration: '1.4s',
    details: 'Parsing package.json, detecting DOM hooks (#root, #portal), and building global symbol table.'
  },
  {
    id: 3,
    title: 'Autonomous Migration',
    subtitle: 'Batch translation via Meta Muse-Spark-1.3',
    engine: 'Meta Muse-Spark-1.3 Engine',
    status: 'pending',
    progress: 0,
    duration: '3.2s',
    details: 'Generative TypeScript synthesis, interface extraction, and JSX to TSX conversion.'
  },
  {
    id: 4,
    title: 'Sandbox Type-Check & Vitest',
    subtitle: 'tsc --noEmit & suite pass',
    engine: 'TypeScript 5.7 Sandbox',
    status: 'pending',
    progress: 0,
    duration: '2.1s',
    details: 'Running strict compiler pass, verifying prop contract integrity, and executing Vitest suite.'
  },
  {
    id: 5,
    title: 'Self-Healing Verification',
    subtitle: 'Compiler fix loop & export',
    engine: 'AST Healer & Fix-Loop Agent',
    status: 'pending',
    progress: 0,
    duration: '1.1s',
    details: 'Auto-resolving TS2322 / TS2339 union discrepancies and packaging production artifact.'
  }
];

export const MOCK_DEPENDENCIES: DependencyItem[] = [
  { name: 'react', currentVersion: '^18.2.0', typesPackage: '@types/react@^18.3.18', typesInstalled: true, category: 'production' },
  { name: 'react-dom', currentVersion: '^18.2.0', typesPackage: '@types/react-dom@^18.3.5', typesInstalled: true, category: 'production' },
  { name: 'lucide-react', currentVersion: '^0.475.0', typesPackage: 'Built-in typings', typesInstalled: true, category: 'production' },
  { name: 'framer-motion', currentVersion: '^11.18.0', typesPackage: 'Built-in typings', typesInstalled: true, category: 'production' },
  { name: 'tailwindcss', currentVersion: '^3.4.17', typesPackage: 'Not required', typesInstalled: true, category: 'dev' },
  { name: 'typescript', currentVersion: 'None (Legacy)', typesPackage: 'typescript@^5.7.3 injected', typesInstalled: true, category: 'dev' },
  { name: 'vite', currentVersion: '^5.0.0', typesPackage: 'Built-in typings', typesInstalled: true, category: 'dev' },
];

export const MOCK_DOM_BINDINGS: DomBinding[] = [
  { selector: '#root', type: 'HTMLDivElement', occurrences: 2, inferredType: 'HTMLElement | null' },
  { selector: '#modal-portal', type: 'HTMLDivElement', occurrences: 1, inferredType: 'HTMLElement' },
  { selector: 'window.__INITIAL_DATA__', type: 'GlobalWindowProperty', occurrences: 3, inferredType: 'Record<string, unknown>' },
  { selector: 'IntersectionObserver', type: 'BrowserAPI', occurrences: 4, inferredType: 'IntersectionObserver' },
];

export const MOCK_BLUEPRINT: BlueprintStrategy = {
  targetTsConfig: 'strict: true, noImplicitAny: true',
  strictnessLevel: 'strict',
  jsxRuntime: 'react-jsx',
  totalJsFiles: 6,
  totalTsGenerated: 6,
  typeSafetyConfidence: 98.4,
  astPasses: 14
};

export const MOCK_FILES: FileItem[] = [
  {
    id: 'app-component',
    name: 'App.jsx',
    path: 'src/App.jsx',
    originalExt: '.jsx',
    targetExt: '.tsx',
    status: 'passed',
    category: 'component',
    stats: {
      added: 42,
      removed: 18,
      typeErrors: 0,
      coverage: 100
    },
    astSymbols: ['UserProfile', 'AppProps', 'MetricPayload', 'useCallback', 'useEffect'],
    dependencies: ['react', 'lucide-react', './components/Card'],
    originalCode: `// Legacy JavaScript source: src/App.jsx
import React, { useState, useEffect } from 'react';
import Card from './components/Card';
import { fetchUserData } from './utils/apiClient';

function App(props) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    fetchUserData(props.userId)
      .then(data => {
        setUser(data.user);
        setMetrics(data.metrics || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load user", err);
        setLoading(false);
      });
  }, [props.userId]);

  const handleCardClick = (metricId) => {
    console.log("Inspecting metric:", metricId);
  };

  if (loading) {
    return <div className="spinner">Loading telemetry data...</div>;
  }

  return (
    <div className="dashboard-container">
      <header>
        <h1>Welcome back, {user ? user.name : 'Developer'}</h1>
        <p>Tenant: {props.tenantId || 'default-preview'}</p>
      </header>

      <div className="grid">
        {metrics.map(m => (
          <Card 
            key={m.id} 
            title={m.title} 
            value={m.value} 
            trend={m.trend}
            onClick={() => handleCardClick(m.id)} 
          />
        ))}
      </div>
    </div>
  );
}

export default App;`,
    migratedCode: `// Autonomous TypeScript Output: src/App.tsx
// Synthesized via Meta Muse-Spark-1.3 Code Engine & TypeScript 5.7 Sandbox
import React, { useState, useEffect, type FC, type ReactElement } from 'react';
import Card, { type MetricCardProps } from './components/Card';
import { fetchUserData, type UserDataResponse } from './utils/apiClient';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'admin' | 'engineer' | 'viewer';
}

export interface MetricItem {
  id: string;
  title: string;
  value: number | string;
  trend: 'up' | 'down' | 'neutral';
  deltaPercent?: number;
}

export interface AppProps {
  userId: string;
  tenantId?: string;
  enableTelemetry?: boolean;
}

export const App: FC<AppProps> = ({ 
  userId, 
  tenantId = 'default-preview', 
  enableTelemetry = false 
}): ReactElement => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<MetricItem[]>([]);

  useEffect(() => {
    let isSubscribed = true;

    async function loadData(): Promise<void> {
      try {
        const data: UserDataResponse = await fetchUserData(userId);
        if (isSubscribed) {
          setUser(data.user);
          setMetrics(data.metrics ?? []);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('[MigrationPilot] Telemetry fetch failure:', err.message);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    void loadData();
    return () => { isSubscribed = false; };
  }, [userId]);

  const handleCardClick = (metricId: string): void => {
    if (enableTelemetry) {
      console.info('[Telemetry] Metric inspection triggered:', metricId);
    }
  };

  if (loading) {
    return (
      <div className="spinner flex items-center justify-center p-8 text-palette-stone">
        <span className="font-mono text-sm">Loading telemetry data...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-container space-y-6">
      <header className="border-b border-palette-taupe/20 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-palette-light">
          Welcome back, {user ? user.name : 'Developer'}
        </h1>
        <p className="text-xs text-palette-stone font-mono">
          Tenant ID: <span className="text-palette-sand">{tenantId}</span>
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric: MetricItem) => (
          <Card
            key={metric.id}
            title={metric.title}
            value={metric.value}
            trend={metric.trend}
            onClick={() => handleCardClick(metric.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default App;`,
    typeInferenceNotes: [
      'Inferred UserProfile interface from API response payload and template accessors.',
      'Extracted MetricItem type union ("up" | "down" | "neutral") from legacy conditional logic.',
      'Protected async effect with subscription teardown flag.',
      'Replaced dangerous any catch block with safe unknown + instanceof Error guard.'
    ]
  },
  {
    id: 'card-component',
    name: 'Card.jsx',
    path: 'src/components/Card.jsx',
    originalExt: '.jsx',
    targetExt: '.tsx',
    status: 'healed',
    category: 'component',
    stats: {
      added: 29,
      removed: 11,
      typeErrors: 0,
      coverage: 100
    },
    astSymbols: ['MetricCardProps', 'TrendType', 'LucideIcon'],
    dependencies: ['react', 'lucide-react'],
    originalCode: `// Legacy JavaScript source: src/components/Card.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function Card(props) {
  const getIcon = () => {
    if (props.trend === 'up') return <TrendingUp className="text-emerald-400" />;
    if (props.trend === 'down') return <TrendingDown className="text-rose-400" />;
    return <Minus className="text-stone-400" />;
  };

  return (
    <div className="card" onClick={props.onClick}>
      <div className="header">
        <span className="title">{props.title}</span>
        {getIcon()}
      </div>
      <div className="value">{props.value}</div>
    </div>
  );
}`,
    migratedCode: `// Autonomous TypeScript Output: src/components/Card.tsx
// Self-Healing Verified: Fixed TS2322 on polymorphic SVG className and missing MouseEventHandler
import React, { type FC, type ReactElement, type MouseEventHandler } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: TrendDirection;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
}

export const Card: FC<MetricCardProps> = ({
  title,
  value,
  trend = 'neutral',
  onClick,
  className = ''
}): ReactElement => {
  const renderTrendIcon = (): ReactElement => {
    const iconSize = 18;
    switch (trend) {
      case 'up':
        return <TrendingUp size={iconSize} className="text-emerald-400 transition-colors" aria-label="Upward trend" />;
      case 'down':
        return <TrendingDown size={iconSize} className="text-rose-400 transition-colors" aria-label="Downward trend" />;
      case 'neutral':
      default:
        return <Minus size={iconSize} className="text-palette-stone transition-colors" aria-label="Neutral trend" />;
    }
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : 'region'}
      tabIndex={onClick ? 0 : undefined}
      className={\`bg-palette-darker/80 border border-palette-taupe/25 rounded-lg p-4 cursor-pointer hover:border-palette-sand transition-all duration-150 \${className}\`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-medium text-palette-stone uppercase tracking-wider">{title}</span>
        {renderTrendIcon()}
      </div>
      <div className="text-2xl font-bold font-mono tracking-tight text-palette-light">{value}</div>
    </div>
  );
};

export default Card;`,
    healedReasons: [
      'Self-Healing Pass: Auto-resolved TS2322 (MouseEventHandler typing on div)',
      'Added accessibility role="button" and tabIndex when onClick handler is present',
      'Injected explicit union type TrendDirection with neutral fallback default'
    ]
  },
  {
    id: 'api-client-util',
    name: 'apiClient.js',
    path: 'src/utils/apiClient.js',
    originalExt: '.js',
    targetExt: '.ts',
    status: 'passed',
    category: 'util',
    stats: {
      added: 38,
      removed: 14,
      typeErrors: 0,
      coverage: 100
    },
    astSymbols: ['ApiResponse', 'UserDataResponse', 'fetchUserData', 'HttpError'],
    dependencies: ['fetch'],
    originalCode: `// Legacy JavaScript source: src/utils/apiClient.js
const API_BASE = '/api/v1';

export async function fetchUserData(userId) {
  const res = await fetch(\`\${API_BASE}/users/\${userId}\`);
  if (!res.ok) {
    throw new Error('HTTP ' + res.status);
  }
  return await res.json();
}

export function formatTimestamp(dateStr) {
  return new Date(dateStr).toISOString();
}`,
    migratedCode: `// Autonomous TypeScript Output: src/utils/apiClient.ts
import type { UserProfile, MetricItem } from '../App';

const API_BASE = '/api/v1' as const;

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly responseBody?: unknown
  ) {
    super(\`[HttpError] \${status}: \${statusText}\`);
    this.name = 'HttpError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface UserDataResponse {
  user: UserProfile;
  metrics: MetricItem[];
  timestamp: string;
  serverVersion: string;
}

export async function fetchUserData(userId: string): Promise<UserDataResponse> {
  if (!userId || typeof userId !== 'string') {
    throw new TypeError('Parameter "userId" must be a non-empty string');
  }

  const response = await fetch(\`\${API_BASE}/users/\${encodeURIComponent(userId)}\`, {
    headers: {
      'Accept': 'application/json',
      'X-Client-Agent': 'MigrationPilot-Agent/1.0'
    }
  });

  if (!response.ok) {
    let errorPayload: unknown;
    try {
      errorPayload = await response.json();
    } catch {
      errorPayload = await response.text();
    }
    throw new HttpError(response.status, response.statusText, errorPayload);
  }

  const payload = (await response.json()) as UserDataResponse;
  return payload;
}

export function formatTimestamp(dateStr: string | number | Date): string {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    throw new RangeError('Invalid date input provided to formatTimestamp');
  }
  return parsed.toISOString();
}`,
    typeInferenceNotes: [
      'Introduced strongly typed HttpError class extending standard Error with proper prototype link.',
      'Added URI component safety encoding on dynamic REST endpoint segment.',
      'Configured UserDataResponse interface with exact server response contract.'
    ]
  },
  {
    id: 'use-local-storage',
    name: 'useLocalStorage.js',
    path: 'src/hooks/useLocalStorage.js',
    originalExt: '.js',
    targetExt: '.ts',
    status: 'healed',
    category: 'hook',
    stats: {
      added: 35,
      removed: 12,
      typeErrors: 0,
      coverage: 100
    },
    astSymbols: ['useLocalStorage', 'StorageKey', 'GenericDispatch'],
    dependencies: ['react'],
    originalCode: `// Legacy JavaScript source: src/hooks/useLocalStorage.js
import { useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}`,
    migratedCode: `// Autonomous TypeScript Output: src/hooks/useLocalStorage.ts
// Self-Healing Verified: Fixed generic inference type mismatch for function-updater overload
import { useState, useCallback, type Dispatch, type SetStateAction } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
      return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    } catch (error: unknown) {
      console.warn(\`[MigrationPilot] Failed to retrieve key "\${key}" from localStorage:\`, error);
      return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = useCallback((value: SetStateAction<T>): void => {
    try {
      setStoredValue((currentValue: T): T => {
        const resolvedValue = typeof value === 'function' 
          ? (value as (prevState: T) => T)(currentValue)
          : value;

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(resolvedValue));
        }

        return resolvedValue;
      });
    } catch (error: unknown) {
      console.warn(\`[MigrationPilot] Failed to persist key "\${key}" to localStorage:\`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}`,
    healedReasons: [
      'Self-Healing Pass: Auto-resolved TS2345 (Argument of type "SetStateAction<T>" not assignable to function)',
      'SSR Safe Guard: Added typeof window checks for Next.js/Vite SSR hydration stability',
      'Generic Type Tuple return type explicitly annotated: [T, Dispatch<SetStateAction<T>>]'
    ]
  },
  {
    id: 'package-json',
    name: 'package.json',
    path: 'package.json',
    originalExt: '.json',
    targetExt: '.json',
    status: 'passed',
    category: 'config',
    stats: {
      added: 8,
      removed: 2,
      typeErrors: 0,
      coverage: 100
    },
    astSymbols: ['devDependencies', 'scripts.typecheck'],
    dependencies: ['typescript', '@types/react', '@types/react-dom'],
    originalCode: `{
  "name": "legacy-react-repo",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.475.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}`,
    migratedCode: `{
  "name": "legacy-react-repo",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint:types": "tsc --noEmit",
    "test:vitest": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.475.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "typescript": "^5.7.3",
    "vite": "^6.1.0",
    "vitest": "^2.1.0"
  }
}`,
    typeInferenceNotes: [
      'Injected @types/react and @types/react-dom matched to React v18.',
      'Added "lint:types" script executing strict tsc --noEmit.',
      'Updated to modern ESM module resolution syntax.'
    ]
  },
  {
    id: 'tsconfig-json',
    name: 'tsconfig.json',
    path: 'tsconfig.json',
    originalExt: 'none',
    targetExt: '.json',
    status: 'passed',
    category: 'config',
    stats: {
      added: 26,
      removed: 0,
      typeErrors: 0,
      coverage: 100
    },
    astSymbols: ['compilerOptions', 'strict', 'jsx'],
    dependencies: ['typescript'],
    originalCode: `// tsconfig.json did not exist in the legacy JavaScript repository.
// Project was unmanaged with zero static typing.`,
    migratedCode: `{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Strict Type-Checking Options */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  },
  "include": ["src"]
}`,
    typeInferenceNotes: [
      'Engine synthesized strict tsconfig.json with exactOptionalPropertyTypes and noUncheckedIndexedAccess.',
      'Configured React 18+ automatic JSX runtime (react-jsx).'
    ]
  }
];

export const MOCK_STREAMING_LOGS: LogEntry[] = [
  { id: '1', timestamp: '14:02:10.114', level: 'info', prefix: '[*]', message: 'Repository ingestion initialized: https://github.com/owner/legacy-react-repo (branch: main)' },
  { id: '2', timestamp: '14:02:10.580', level: 'info', prefix: '[*]', message: 'Cloning tree and unpacking blob manifests... completed (24ms)' },
  { id: '3', timestamp: '14:02:11.022', level: 'ast', prefix: '[AST]', message: 'Found 4 candidate files: src/App.jsx, src/components/Card.jsx, src/utils/apiClient.js, src/hooks/useLocalStorage.js' },
  { id: '4', timestamp: '14:02:11.450', level: 'ast', prefix: '[AST]', message: 'Parsing dependencies: detected react@18.2.0, missing @types/react and @types/react-dom' },
  { id: '5', timestamp: '14:02:11.890', level: 'ast', prefix: '[AST]', message: 'Extracted DOM bindings: selector "#root" bound to HTMLDivElement (occurrences: 2)' },
  { id: '6', timestamp: '14:02:12.310', level: 'muse', prefix: '[MUSE-SPARK]', message: 'Batch dispatch: translating 4 files via Meta Muse-Spark-1.3 model with strict interface mode' },
  { id: '7', timestamp: '14:02:13.110', level: 'muse', prefix: '[MUSE-SPARK]', message: 'Inferred interfaces: UserProfile, MetricCardProps, UserDataResponse, StorageKey' },
  { id: '8', timestamp: '14:02:13.780', level: 'tsc', prefix: '[TSC]', message: 'Executing sandbox typecheck: npx tsc --noEmit --project tsconfig.json' },
  { id: '9', timestamp: '14:02:14.220', level: 'warn', prefix: '[TSC-WARN]', message: 'TS2322 detected in src/components/Card.tsx: Type "MouseEvent" polymorphic mismatch with div props' },
  { id: '10', timestamp: '14:02:14.650', level: 'success', prefix: '[HEALER]', message: 'Self-Healing agent invoked: corrected TS2322 using MouseEventHandler<HTMLDivElement> union' },
  { id: '11', timestamp: '14:02:15.120', level: 'tsc', prefix: '[TSC]', message: 'Re-running sandbox verification: 0 errors detected across 6 source files' },
  { id: '12', timestamp: '14:02:15.540', level: 'success', prefix: '[VITEST]', message: 'Vitest sandbox runner: 12/12 unit and component tests passed (100% assertions green)' },
  { id: '13', timestamp: '14:02:15.910', level: 'success', prefix: '[PILOT]', message: 'Autonomous migration completed! 6 files generated, 0 type errors, 100% type safety confidence.' },
];
