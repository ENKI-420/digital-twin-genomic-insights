// Design Tokens - Unified theme system for GenomicTwin1 AGENT Platform
// Enhanced IRIS MCP SDK themed design system

export const designTokens = {
  // Brand Colors - IRIS MCP Enhanced Theme
  colors: {
    // Primary Brand Palette
    iris: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Primary IRIS Blue
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    },

    // Genomics Accent Colors
    genomic: {
      dna: '#22d3ee',      // Cyan for DNA visualization
      protein: '#a855f7',   // Purple for protein structures
      mutation: '#ef4444',  // Red for mutations/variants
      biomarker: '#10b981', // Green for biomarkers
      drug: '#f59e0b',      // Orange for drug discovery
      trial: '#8b5cf6'      // Violet for clinical trials
    },

    // Agent System Colors
    agents: {
      genomicAnalyst: '#3b82f6',    // Blue
      drugDiscovery: '#8b5cf6',     // Purple
      clinicalDecision: '#10b981',  // Green
      trialMatching: '#f59e0b',     // Orange
      biomarkerDiscovery: '#ef4444', // Red
      lifestyleMapping: '#06b6d4',  // Cyan
      monitoring: '#84cc16'         // Lime
    },

    // Status & Feedback Colors
    status: {
      operational: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      processing: '#3b82f6',
      success: '#22c55e',
      info: '#06b6d4'
    },

    // Neutral Grays
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    }
  },

  // Typography Scale
  typography: {
    fonts: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      medical: ['Source Sans Pro', 'system-ui', 'sans-serif']
    },

    sizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
      '7xl': '4.5rem'    // 72px
    },

    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    }
  },

  // Spacing Scale
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
    36: '9rem',      // 144px
    40: '10rem',     // 160px
    44: '11rem',     // 176px
    48: '12rem',     // 192px
    52: '13rem',     // 208px
    56: '14rem',     // 224px
    60: '15rem',     // 240px
    64: '16rem',     // 256px
    72: '18rem',     // 288px
    80: '20rem',     // 320px
    96: '24rem'      // 384px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000'
  },

  // Component-specific Design Tokens
  components: {
    // Navigation
    navigation: {
      height: '4rem',        // 64px
      sidebarWidth: '16rem', // 256px
      sidebarCollapsedWidth: '4rem' // 64px
    },

    // Cards
    card: {
      padding: '1.5rem',     // 24px
      borderRadius: '0.75rem', // 12px
      shadow: 'md'
    },

    // Buttons
    button: {
      height: {
        sm: '2rem',    // 32px
        md: '2.5rem',  // 40px
        lg: '3rem'     // 48px
      },
      padding: {
        sm: '0.5rem 1rem',    // 8px 16px
        md: '0.75rem 1.5rem', // 12px 24px
        lg: '1rem 2rem'       // 16px 32px
      }
    },

    // Forms
    form: {
      inputHeight: '2.5rem',     // 40px
      inputPadding: '0.75rem',   // 12px
      labelSpacing: '0.5rem'     // 8px
    }
  },

  // Animation & Transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms'
    },

    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
    }
  },

  // Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  },

  // IRIS MCP Specific Tokens
  irisMCP: {
    agents: {
      colors: {
        genomicAnalyst: '#3b82f6',
        drugDiscovery: '#8b5cf6',
        clinicalDecision: '#10b981',
        trialMatching: '#f59e0b',
        biomarkerDiscovery: '#ef4444',
        lifestyleMapping: '#06b6d4',
        monitoring: '#84cc16'
      },
      statusIndicators: {
        active: '#10b981',
        processing: '#f59e0b',
        idle: '#64748b',
        error: '#ef4444'
      }
    },

    drugDiscovery: {
      admet: {
        absorption: '#3b82f7',
        distribution: '#8b5cf6',
        metabolism: '#10b981',
        excretion: '#f59e0b',
        toxicity: '#ef4444'
      }
    },

    genomics: {
      dnaColors: {
        adenine: '#ff6b6b',   // A - Red
        thymine: '#4ecdc4',   // T - Teal
        guanine: '#45b7d1',   // G - Blue
        cytosine: '#f9ca24'   // C - Yellow
      },
      mutationSeverity: {
        benign: '#10b981',
        likely_benign: '#84cc16',
        uncertain: '#f59e0b',
        likely_pathogenic: '#f97316',
        pathogenic: '#ef4444'
      }
    }
  }
} as const

// Type definitions
export type DesignTokens = typeof designTokens
export type ColorScale = typeof designTokens.colors.iris
export type SpacingToken = keyof typeof designTokens.spacing
export type TypographySize = keyof typeof designTokens.typography.sizes

// Utility functions
export const getColorByRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    clinician: designTokens.colors.iris[600],
    oncologist: designTokens.colors.genomic.mutation,
    nurse: designTokens.colors.genomic.biomarker,
    technician: designTokens.colors.genomic.dna,
    researcher: designTokens.colors.genomic.protein,
    admin: designTokens.colors.gray[700]
  }
  return roleMap[role] || designTokens.colors.iris[500]
}

export const getAgentColor = (agentType: string): string => {
  const agentMap: Record<string, string> = {
    'GENOMIC_ANALYSIS_AGENT': designTokens.irisMCP.agents.colors.genomicAnalyst,
    'DRUG_DISCOVERY_AGENT': designTokens.irisMCP.agents.colors.drugDiscovery,
    'CLINICAL_DECISION_SUPPORT_AGENT': designTokens.irisMCP.agents.colors.clinicalDecision,
    'TRIAL_MATCHING_AGENT': designTokens.irisMCP.agents.colors.trialMatching,
    'BIOMARKER_DISCOVERY_AGENT': designTokens.irisMCP.agents.colors.biomarkerDiscovery,
    'LIFESTYLE_MAPPING_AGENT': designTokens.irisMCP.agents.colors.lifestyleMapping,
    'MONITORING_AGENT': designTokens.irisMCP.agents.colors.monitoring
  }
  return agentMap[agentType] || designTokens.colors.iris[500]
}

export const getMutationSeverityColor = (severity: string): string => {
  return designTokens.irisMCP.genomics.mutationSeverity[severity as keyof typeof designTokens.irisMCP.genomics.mutationSeverity] || designTokens.colors.gray[500]
}

export default designTokens
