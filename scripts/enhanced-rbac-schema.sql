-- Enhanced RBAC Schema for ISIS MCP (Medical Control Plane)
-- HIPAA-compliant security and audit framework

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Roles and Permissions System
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  department TEXT,
  clearance_level TEXT CHECK (clearance_level IN ('basic', 'enhanced', 'restricted')) DEFAULT 'basic',
  permissions JSONB DEFAULT '{}',
  ai_model_access TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users with enhanced security context
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id TEXT UNIQUE NOT NULL, -- Reference to Supabase auth.users
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  display_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role_id UUID REFERENCES roles(id),
  department TEXT,
  employee_id TEXT UNIQUE,
  epic_user_id TEXT,

  -- Security attributes
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP WITH TIME ZONE,
  password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Sessions with enhanced tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  refresh_token TEXT,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  geolocation JSONB,

  -- Session state
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Security flags
  is_elevated BOOLEAN DEFAULT false, -- For privileged operations
  security_level TEXT DEFAULT 'standard',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions detailed structure
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource_type TEXT, -- e.g., 'patient_data', 'genomic_reports', 'ai_models'
  action TEXT, -- e.g., 'read', 'write', 'execute', 'admin'
  scope TEXT, -- e.g., 'own_department', 'cross_department', 'system_wide'
  conditions JSONB DEFAULT '{}', -- Additional conditions for permission
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role-Permission mapping
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES users(id),
  conditions JSONB DEFAULT '{}',
  UNIQUE(role_id, permission_id)
);

-- Model Context Protocol Audit Log
CREATE TABLE IF NOT EXISTS mcp_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES user_sessions(id),

  -- Request context
  request_id TEXT UNIQUE NOT NULL,
  model_name TEXT NOT NULL,
  task_intent TEXT NOT NULL,
  model_family TEXT NOT NULL,

  -- Input/Output tracking
  input_hash TEXT NOT NULL,
  output_hash TEXT NOT NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,

  -- Processing details
  response_time_ms INTEGER,
  fallback_triggered BOOLEAN DEFAULT false,
  fallback_models TEXT[],

  -- Security analysis
  phi_detected BOOLEAN DEFAULT false,
  phi_redacted BOOLEAN DEFAULT false,
  safety_violations TEXT[],
  security_score DECIMAL(3,2),

  -- Context packet (encrypted)
  context_packet_encrypted TEXT,

  -- Compliance
  hipaa_compliant BOOLEAN DEFAULT true,
  audit_level TEXT DEFAULT 'standard',
  retention_class TEXT DEFAULT 'standard',

  -- Metadata
  ip_address INET,
  user_agent TEXT,
  department TEXT,
  cost_estimate DECIMAL(10,4),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Events Log
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')) DEFAULT 'info',
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES user_sessions(id),

  -- Event details
  description TEXT,
  event_data JSONB DEFAULT '{}',
  source_ip INET,
  user_agent TEXT,
  endpoint TEXT,

  -- Response details
  action_taken TEXT,
  blocked BOOLEAN DEFAULT false,
  risk_score DECIMAL(3,2),

  -- Investigation
  investigated BOOLEAN DEFAULT false,
  investigated_by UUID REFERENCES users(id),
  investigation_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Safety Monitoring
CREATE TABLE IF NOT EXISTS ai_safety_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',

  -- Associated request
  mcp_audit_id UUID REFERENCES mcp_audit_log(id),
  user_id UUID REFERENCES users(id),
  model_name TEXT,

  -- Incident details
  description TEXT NOT NULL,
  safety_violations TEXT[],
  prompt_injection_detected BOOLEAN DEFAULT false,
  inappropriate_content BOOLEAN DEFAULT false,
  phi_leakage BOOLEAN DEFAULT false,

  -- Response
  automated_response TEXT,
  manual_review_required BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Compliance Reporting
CREATE TABLE IF NOT EXISTS compliance_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_type TEXT NOT NULL,
  report_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  report_period_end TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Report content
  report_data JSONB NOT NULL,
  findings JSONB DEFAULT '{}',
  recommendations TEXT[],

  -- Metadata
  generated_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('draft', 'review', 'approved', 'archived')) DEFAULT 'draft',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Data Access Log (for PHI tracking)
CREATE TABLE IF NOT EXISTS data_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  session_id UUID REFERENCES user_sessions(id),

  -- Access details
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  action TEXT NOT NULL,
  access_reason TEXT,

  -- Patient context (if applicable)
  patient_id UUID,
  phi_accessed BOOLEAN DEFAULT false,
  data_exported BOOLEAN DEFAULT false,

  -- Technical details
  endpoint TEXT,
  query_parameters JSONB,
  response_size INTEGER,

  -- Audit trail
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (id, name, description, department, clearance_level, permissions, ai_model_access) VALUES
  (uuid_generate_v4(), 'admin', 'System Administrator', 'IT', 'restricted', '{"admin": true, "all_permissions": true}', ARRAY['OpenAI-GPT-4o', 'Claude-Opus', 'Claude-Sonnet', 'Mistral', 'Local-Model']),
  (uuid_generate_v4(), 'clinician', 'Licensed Clinician', 'Clinical', 'enhanced', '{"read_phi": true, "write_clinical": true, "ai_analysis": true}', ARRAY['OpenAI-GPT-4o', 'Claude-Opus', 'Claude-Sonnet']),
  (uuid_generate_v4(), 'oncologist', 'Oncology Specialist', 'Oncology', 'enhanced', '{"read_phi": true, "write_clinical": true, "ai_analysis": true, "genomic_analysis": true}', ARRAY['OpenAI-GPT-4o', 'Claude-Opus', 'Claude-Sonnet', 'Mistral']),
  (uuid_generate_v4(), 'nurse', 'Registered Nurse', 'Nursing', 'basic', '{"read_phi": true, "basic_clinical": true}', ARRAY['Claude-Sonnet', 'Local-Model']),
  (uuid_generate_v4(), 'technician', 'Laboratory Technician', 'Laboratory', 'basic', '{"read_lab_results": true, "data_entry": true}', ARRAY['Local-Model']),
  (uuid_generate_v4(), 'researcher', 'Clinical Researcher', 'Research', 'enhanced', '{"read_deidentified": true, "research_analysis": true, "export_data": true}', ARRAY['Claude-Opus', 'Mistral', 'Local-Model']),
  (uuid_generate_v4(), 'patient', 'Patient Portal User', 'Patient', 'basic', '{"read_own_data": true, "patient_portal": true}', ARRAY[]::TEXT[])
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, description, resource_type, action, scope) VALUES
  ('read_phi', 'Read Protected Health Information', 'patient_data', 'read', 'own_department'),
  ('write_clinical', 'Write Clinical Notes', 'clinical_notes', 'write', 'own_department'),
  ('ai_analysis', 'Use AI Analysis Tools', 'ai_models', 'execute', 'own_department'),
  ('genomic_analysis', 'Genomic Data Analysis', 'genomic_data', 'read', 'own_department'),
  ('admin_users', 'Administer Users', 'users', 'admin', 'system_wide'),
  ('export_data', 'Export Data', 'all', 'export', 'own_department'),
  ('cross_department_access', 'Cross-Department Data Access', 'all', 'read', 'cross_department')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_mcp_audit_user_id ON mcp_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_audit_created_at ON mcp_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_mcp_audit_model_name ON mcp_audit_log(model_name);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_data_access_user_id ON data_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_data_access_resource ON data_access_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_data_access_phi ON data_access_log(phi_accessed);

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth_user_id = auth.uid()::text);

CREATE POLICY "Admins can view all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM roles r
      JOIN users u ON u.role_id = r.id
      WHERE u.auth_user_id = auth.uid()::text
      AND r.name = 'admin'
    )
  );

-- RLS policies for audit logs (users can only see their own, admins see all)
CREATE POLICY "Users can view own audit logs" ON mcp_audit_log
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()::text
    )
  );

CREATE POLICY "Admins can view all audit logs" ON mcp_audit_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM roles r
      JOIN users u ON u.role_id = r.id
      WHERE u.auth_user_id = auth.uid()::text
      AND r.name = 'admin'
    )
  );

-- Create functions for common operations
CREATE OR REPLACE FUNCTION check_user_permission(
  auth_user_uuid TEXT,
  permission_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.auth_user_id = auth_user_uuid
    AND p.name = permission_name
  ) INTO has_permission;

  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log data access
CREATE OR REPLACE FUNCTION log_data_access(
  p_user_id UUID,
  p_session_id UUID,
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_action TEXT,
  p_patient_id UUID DEFAULT NULL,
  p_phi_accessed BOOLEAN DEFAULT FALSE
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO data_access_log (
    user_id, session_id, resource_type, resource_id, action, patient_id, phi_accessed
  ) VALUES (
    p_user_id, p_session_id, p_resource_type, p_resource_id, p_action, p_patient_id, p_phi_accessed
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user last activity
CREATE OR REPLACE FUNCTION update_user_activity(
  p_session_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE user_sessions
  SET last_activity = NOW()
  WHERE id = p_session_id AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for reporting
CREATE OR REPLACE VIEW user_permissions_view AS
SELECT
  u.id as user_id,
  u.email,
  u.display_name,
  u.department,
  r.name as role_name,
  r.clearance_level,
  array_agg(p.name) as permissions,
  r.ai_model_access
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
GROUP BY u.id, u.email, u.display_name, u.department, r.name, r.clearance_level, r.ai_model_access;

CREATE OR REPLACE VIEW audit_summary_view AS
SELECT
  DATE(created_at) as audit_date,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN phi_detected THEN 1 END) as phi_requests,
  COUNT(CASE WHEN fallback_triggered THEN 1 END) as fallback_requests,
  COUNT(CASE WHEN array_length(safety_violations, 1) > 0 THEN 1 END) as safety_violations,
  AVG(response_time_ms) as avg_response_time,
  SUM(total_tokens) as total_tokens_used,
  SUM(cost_estimate) as total_cost
FROM mcp_audit_log
GROUP BY DATE(created_at)
ORDER BY audit_date DESC;

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE roles IS 'User roles with AI model access permissions';
COMMENT ON TABLE users IS 'Enhanced user profiles with security attributes';
COMMENT ON TABLE user_sessions IS 'Active user sessions with security tracking';
COMMENT ON TABLE mcp_audit_log IS 'Complete audit log for all AI model interactions';
COMMENT ON TABLE security_events IS 'Security incidents and violations';
COMMENT ON TABLE ai_safety_incidents IS 'AI safety monitoring and incident tracking';
COMMENT ON TABLE data_access_log IS 'PHI and data access tracking for compliance';
COMMENT ON TABLE compliance_reports IS 'Generated compliance reports';

-- Set up automatic cleanup jobs (to be run via cron or scheduled jobs)
-- Clean up expired sessions
-- DELETE FROM user_sessions WHERE expires_at < NOW() - INTERVAL '7 days';

-- Archive old audit logs (move to cold storage after 7 years for HIPAA)
-- This would be implemented in your application logic or database maintenance scripts