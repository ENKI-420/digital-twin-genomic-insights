-- Create clinical_trials table if it doesn't exist
CREATE TABLE IF NOT EXISTS clinical_trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  phase TEXT NOT NULL,
  condition TEXT,
  intervention TEXT,
  sponsor TEXT,
  status TEXT DEFAULT 'recruiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trial_genomic_criteria table if it doesn't exist
CREATE TABLE IF NOT EXISTS trial_genomic_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trial_id UUID REFERENCES clinical_trials(id) ON DELETE CASCADE,
  gene TEXT NOT NULL,
  variant TEXT,
  expression TEXT,
  biomarker TEXT,
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient_genomic_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS patient_genomic_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,
  gene TEXT NOT NULL,
  variant TEXT,
  expression TEXT,
  biomarker TEXT,
  confidence FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient_trial_matches table if it doesn't exist
CREATE TABLE IF NOT EXISTS patient_trial_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,
  trial_id UUID REFERENCES clinical_trials(id) ON DELETE CASCADE,
  match_score FLOAT NOT NULL,
  eligibility_status TEXT NOT NULL,
  genomic_match BOOLEAN NOT NULL,
  clinical_match BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample clinical trials
INSERT INTO clinical_trials (id, title, phase, condition, intervention, sponsor, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'BRCA-Positive Breast Cancer Targeted Therapy Trial', 'II', 'Breast Cancer', 'PARP Inhibitor', 'Norton Cancer Institute', 'recruiting'),
  ('22222222-2222-2222-2222-222222222222', 'EGFR-Mutated Lung Cancer Immunotherapy Study', 'III', 'Lung Cancer', 'Immunotherapy', 'Memorial Sloan Kettering', 'recruiting'),
  ('33333333-3333-3333-3333-333333333333', 'KRAS G12C Inhibitor for Colorectal Cancer', 'I', 'Colorectal Cancer', 'KRAS Inhibitor', 'MD Anderson Cancer Center', 'recruiting'),
  ('44444444-4444-4444-4444-444444444444', 'CYP2D6 Pharmacogenomic-Guided Tamoxifen Therapy', 'III', 'Breast Cancer', 'Tamoxifen', 'Mayo Clinic', 'recruiting');

-- Insert trial genomic criteria
INSERT INTO trial_genomic_criteria (trial_id, gene, variant, expression, biomarker, required)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'BRCA1', 'mutation', NULL, NULL, true),
  ('11111111-1111-1111-1111-111111111111', 'BRCA2', 'mutation', NULL, NULL, true),
  ('11111111-1111-1111-1111-111111111111', 'PTEN', 'wild-type', NULL, NULL, false),
  
  ('22222222-2222-2222-2222-222222222222', 'EGFR', 'L858R', NULL, NULL, true),
  ('22222222-2222-2222-2222-222222222222', 'EGFR', 'T790M', NULL, NULL, false),
  ('22222222-2222-2222-2222-222222222222', 'PD-L1', NULL, 'high', NULL, true),
  
  ('33333333-3333-3333-3333-333333333333', 'KRAS', 'G12C', NULL, NULL, true),
  ('33333333-3333-3333-3333-333333333333', 'TP53', 'mutation', NULL, NULL, false),
  ('33333333-3333-3333-3333-333333333333', 'MSI', NULL, NULL, 'high', false),
  
  ('44444444-4444-4444-4444-444444444444', 'CYP2D6', '*1/*1', NULL, NULL, false),
  ('44444444-4444-4444-4444-444444444444', 'CYP2D6', '*1/*4', NULL, NULL, false),
  ('44444444-4444-4444-4444-444444444444', 'ESR1', NULL, 'positive', NULL, true);

-- Insert sample patient genomic profiles
INSERT INTO patient_genomic_profiles (patient_id, gene, variant, expression, biomarker, confidence)
VALUES
  -- Patient 1 (PAT_001) - Sarah Johnson
  ('PAT_001', 'BRCA1', 'wild-type', NULL, NULL, 0.95),
  ('PAT_001', 'HER2', NULL, 'high', NULL, 0.98),
  ('PAT_001', 'CYP2D6', '*4/*4', NULL, NULL, 0.99),
  
  -- Patient 2 (PAT_002) - Michael Chen
  ('PAT_002', 'EGFR', 'L858R', NULL, NULL, 0.97),
  ('PAT_002', 'PD-L1', NULL, 'high', NULL, 0.85),
  ('PAT_002', 'CYP2C19', '*2/*2', NULL, NULL, 0.99),
  
  -- Patient 3 (PAT_003) - Emily Rodriguez
  ('PAT_003', 'KRAS', 'G12C', NULL, NULL, 0.92),
  ('PAT_003', 'DPYD', '*2A', NULL, NULL, 0.95),
  ('PAT_003', 'MSI', NULL, NULL, 'high', 0.90),
  
  -- Patient 4 (PAT_004) - David Thompson
  ('PAT_004', 'BRCA2', 'mutation', NULL, NULL, 0.94),
  ('PAT_004', 'CYP2D6', '*1/*4', NULL, NULL, 0.97),
  ('PAT_004', 'PTEN', 'wild-type', NULL, NULL, 0.88),
  
  -- Patient 5 (PAT_005) - Lisa Wang
  ('PAT_005', 'BRCA1', 'mutation', NULL, NULL, 0.96),
  ('PAT_005', 'CYP2C19', '*1/*17', NULL, NULL, 0.93),
  ('PAT_005', 'ESR1', NULL, 'positive', NULL, 0.97);
