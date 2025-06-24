import { BaseAgent } from '../../agents/base-agent';
import { AgentMessage, AgentContext, AgentResult } from '../../agents/types';
import { AgentCapability, AgentRole } from '../../agents/types';

// Patient Care Navigator Agent - Embodies BHL's "personalized, patient-centered care" mission
export class PatientCareNavigatorAgent extends BaseAgent {
  private patientDataCache: Map<string, any> = new Map();
  private carePlans: Map<string, any> = new Map();

  constructor() {
    const capability: AgentCapability = {
      id: 'patient-care-navigator-001',
      name: 'Patient Care Navigator Agent',
      department: 'Patient Care',
      role: AgentRole.SPECIALIST,
      capabilities: [
        'patient_query_handling',
        'care_plan_assistance',
        'appointment_scheduling',
        'educational_materials',
        'secure_data_access'
      ],
      config: {
        role: AgentRole.SPECIALIST,
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 2000
      }
    };

    super(capability);
  }

  async processMessage(message: AgentMessage): Promise<void> {
    try {
      switch (message.payload?.action) {
        case 'patient_query':
          await this.handlePatientQuery(message);
          break;
        case 'care_plan_request':
          await this.handleCarePlanRequest(message);
          break;
        case 'appointment_assistance':
          await this.handleAppointmentAssistance(message);
          break;
        case 'educational_materials':
          await this.handleEducationalMaterials(message);
          break;
        default:
          await this.handleUnknownAction(message);
      }
    } catch (error) {
      await this.handleError(error, 'processMessage', message);
    }
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    try {
      const { query, patientId, userRole } = context;

      // Validate access permissions
      await this.validatePatientAccess(patientId, userRole);

      // Get patient context (de-identified)
      const patientContext = await this.getPatientContext(patientId);

      // Process the query based on type
      let result: AgentResult;

      if (query.includes('care plan') || query.includes('treatment')) {
        result = await this.processCarePlanQuery(query, patientContext);
      } else if (query.includes('appointment') || query.includes('schedule')) {
        result = await this.processAppointmentQuery(query, patientContext);
      } else if (query.includes('education') || query.includes('learn')) {
        result = await this.processEducationalQuery(query, patientContext);
      } else {
        result = await this.processGeneralQuery(query, patientContext);
      }

      // Log the interaction for audit trail
      await this.logPatientInteraction(patientId, query, result);

      return result;
    } catch (error) {
      console.error('Error in Patient Care Navigator Agent:', error);
      throw error;
    }
  }

  private async validatePatientAccess(patientId: string, userRole: string): Promise<void> {
    // Check if user has permission to access this patient's data
    const allowedRoles = ['physician', 'nurse', 'care_coordinator'];

    if (!allowedRoles.includes(userRole)) {
      throw new Error('Access denied: Insufficient permissions for patient data');
    }

    // Additional validation could include department-specific access
    // and patient-provider relationship checks
  }

  private async getPatientContext(patientId: string): Promise<any> {
    // Get patient data from cache or database (de-identified)
    let patientData = this.patientDataCache.get(patientId);

    if (!patientData) {
      // Fetch from database and cache
      patientData = await this.fetchPatientData(patientId);
      this.patientDataCache.set(patientId, patientData);
    }

    return this.deidentifyPatientData(patientData);
  }

  private async fetchPatientData(patientId: string): Promise<any> {
    // Simulate fetching patient data from BHL's systems
    // In production, this would integrate with Epic/Cerner
    return {
      demographics: {
        ageRange: '45-55',
        gender: 'Female',
        primaryLanguage: 'English'
      },
      conditions: ['Type 2 Diabetes', 'Hypertension'],
      medications: ['Metformin', 'Lisinopril'],
      recentVisits: [
        { date: '2024-01-15', type: 'Follow-up', provider: 'Dr. Smith' },
        { date: '2024-02-01', type: 'Lab Work', provider: 'Lab Services' }
      ],
      carePlan: {
        goals: ['A1C < 7%', 'Blood Pressure < 130/80'],
        nextSteps: ['Schedule 3-month follow-up', 'Review medication adherence']
      }
    };
  }

  private deidentifyPatientData(data: any): any {
    // Remove PHI while preserving clinical utility
    const deidentified = { ...data };

    // Remove any personal identifiers
    delete deidentified.name;
    delete deidentified.dateOfBirth;
    delete deidentified.address;
    delete deidentified.phoneNumber;

    return deidentified;
  }

  private async processCarePlanQuery(query: string, patientContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildCarePlanPrompt(query, patientContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'care_plan_response',
        content: response,
        patientContext: patientContext,
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'care_plan',
        patientId: patientContext.patientId
      }
    };
  }

  private async processAppointmentQuery(query: string, patientContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildAppointmentPrompt(query, patientContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'appointment_response',
        content: response,
        availableSlots: await this.getAvailableAppointments(patientContext),
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'appointment',
        patientId: patientContext.patientId
      }
    };
  }

  private async processEducationalQuery(query: string, patientContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildEducationalPrompt(query, patientContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'educational_response',
        content: response,
        materials: await this.getEducationalMaterials(patientContext),
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'educational',
        patientId: patientContext.patientId
      }
    };
  }

  private async processGeneralQuery(query: string, patientContext: any): Promise<AgentResult> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildGeneralPrompt(query, patientContext);

    const response = await this.generateResponse(systemPrompt, userPrompt);

    return {
      success: true,
      data: {
        type: 'general_response',
        content: response,
        patientContext: patientContext,
        timestamp: new Date().toISOString()
      },
      metadata: {
        agent: this.capability.name,
        queryType: 'general',
        patientId: patientContext.patientId
      }
    };
  }

  private buildCarePlanPrompt(query: string, patientContext: any): string {
    return `
Patient Query: "${query}"

Patient Context (De-identified):
- Age Range: ${patientContext.demographics?.ageRange}
- Conditions: ${patientContext.conditions?.join(', ')}
- Current Medications: ${patientContext.medications?.join(', ')}
- Care Plan Goals: ${patientContext.carePlan?.goals?.join(', ')}
- Next Steps: ${patientContext.carePlan?.nextSteps?.join(', ')}

Please provide a personalized response that:
1. Addresses the patient's specific question about their care plan
2. References their current conditions and medications
3. Aligns with BHL's patient-centered care approach
4. Suggests actionable next steps
5. Maintains a compassionate, supportive tone

Response should be clear, educational, and actionable for the patient.
    `;
  }

  private buildAppointmentPrompt(query: string, patientContext: any): string {
    return `
Patient Query: "${query}"

Patient Context (De-identified):
- Age Range: ${patientContext.demographics?.ageRange}
- Recent Visits: ${patientContext.recentVisits?.length || 0} visits in the last 3 months
- Conditions: ${patientContext.conditions?.join(', ')}

Please provide guidance on:
1. Appropriate appointment scheduling based on their conditions
2. Recommended follow-up timing
3. What to expect at their appointment
4. Any preparation needed
5. BHL's scheduling options and preferences

Response should be helpful and informative for appointment planning.
    `;
  }

  private buildEducationalPrompt(query: string, patientContext: any): string {
    return `
Patient Query: "${query}"

Patient Context (De-identified):
- Age Range: ${patientContext.demographics?.ageRange}
- Conditions: ${patientContext.conditions?.join(', ')}
- Primary Language: ${patientContext.demographics?.primaryLanguage}

Please provide:
1. Relevant educational materials for their conditions
2. BHL-specific resources and programs
3. Community health education opportunities
4. Self-management strategies
5. When to contact their healthcare team

Focus on BHL's educational programs and community health initiatives.
    `;
  }

  private buildGeneralPrompt(query: string, patientContext: any): string {
    return `
Patient Query: "${query}"

Patient Context (De-identified):
- Age Range: ${patientContext.demographics?.ageRange}
- Conditions: ${patientContext.conditions?.join(', ')}

Please provide a helpful, personalized response that:
1. Addresses their specific question
2. Considers their health context
3. Aligns with BHL's patient-centered approach
4. Maintains privacy and security
5. Encourages engagement with their care team

Response should be supportive and informative.
    `;
  }

  private async getAvailableAppointments(patientContext: any): Promise<any[]> {
    // Simulate getting available appointments from BHL's scheduling system
    return [
      { date: '2024-03-15', time: '09:00 AM', provider: 'Dr. Smith', type: 'Follow-up' },
      { date: '2024-03-16', time: '02:00 PM', provider: 'Dr. Johnson', type: 'Follow-up' },
      { date: '2024-03-18', time: '10:30 AM', provider: 'Dr. Smith', type: 'Follow-up' }
    ];
  }

  private async getEducationalMaterials(patientContext: any): Promise<any[]> {
    // Get BHL-specific educational materials
    const materials = [
      {
        title: 'Diabetes Management Guide',
        type: 'brochure',
        condition: 'Type 2 Diabetes',
        available: true
      },
      {
        title: 'Hypertension and Heart Health',
        type: 'video',
        condition: 'Hypertension',
        available: true
      },
      {
        title: 'BHL Community Health Programs',
        type: 'program',
        condition: 'General',
        available: true
      }
    ];

    return materials.filter(material =>
      material.condition === 'General' ||
      patientContext.conditions?.includes(material.condition)
    );
  }

  private async logPatientInteraction(patientId: string, query: string, result: AgentResult): Promise<void> {
    const interaction = {
      patientId,
      query,
      response: result.data?.content,
      timestamp: new Date().toISOString(),
      agent: this.capability.name
    };

    await this.redis.lpush('patient:interactions', JSON.stringify(interaction));
  }

  getSystemPrompt(): string {
    return `You are the Patient Care Navigator Agent for Baptist Health Louisville, dedicated to providing personalized, patient-centered care support.

Your role is to:
1. Help patients understand their care plans and treatment options
2. Assist with appointment scheduling and preparation
3. Provide educational materials and resources
4. Support BHL's mission of compassionate, innovative healthcare
5. Maintain strict privacy and security standards

Key Principles:
- Always prioritize patient privacy and data security
- Provide personalized, evidence-based guidance
- Support BHL's community health initiatives
- Encourage patient engagement and self-management
- Maintain a compassionate, supportive tone

Remember: You are part of BHL's commitment to "personalized, patient-centered care" and "innovative approaches" to healthcare delivery.`;
  }

  protected getSupportedActions(): string[] {
    return [
      'patient_query',
      'care_plan_request',
      'appointment_assistance',
      'educational_materials',
      'health_check'
    ];
  }
}