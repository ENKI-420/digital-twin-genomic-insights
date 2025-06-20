import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface WorkflowTask {
  id: string
  type: "documentation" | "scheduling" | "communication" | "ordering" | "review" | "alert"
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled"
  assignedTo: string
  patientId?: string
  title: string
  description: string
  dueDate: string
  estimatedDuration: number // minutes
  dependencies: string[]
  automationLevel: "manual" | "semi_automated" | "fully_automated"
  createdAt: string
  updatedAt: string
}

export interface AutomationRule {
  id: string
  name: string
  trigger: TriggerCondition
  actions: AutomationAction[]
  conditions: RuleCondition[]
  isActive: boolean
  successRate: number
  timeSaved: number // minutes per execution
}

export interface TriggerCondition {
  type: "lab_result" | "vital_sign" | "medication_order" | "appointment" | "time_based" | "manual"
  parameters: Record<string, any>
}

export interface AutomationAction {
  type:
    | "create_task"
    | "send_notification"
    | "update_record"
    | "schedule_appointment"
    | "order_test"
    | "generate_document"
  parameters: Record<string, any>
  delay?: number // minutes
}

export interface RuleCondition {
  field: string
  operator: "equals" | "greater_than" | "less_than" | "contains" | "not_equals"
  value: any
}

export interface WorkflowMetrics {
  totalTasks: number
  completedTasks: number
  averageCompletionTime: number
  automationRate: number
  timeSaved: number
  errorRate: number
  userSatisfaction: number
}

export class WorkflowAutomationEngine {
  private redis: Redis

  constructor() {
    this.redis = redis
  }

  async createTask(task: Omit<WorkflowTask, "id" | "createdAt" | "updatedAt">): Promise<WorkflowTask> {
    const newTask: WorkflowTask = {
      ...task,
      id: this.generateTaskId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await this.redis.setex(`task:${newTask.id}`, 86400 * 7, JSON.stringify(newTask))
    await this.addToTaskQueue(newTask)

    return newTask
  }

  async processAutomationRules(trigger: TriggerCondition, context: any): Promise<WorkflowTask[]> {
    const rules = await this.getActiveRules()
    const triggeredTasks: WorkflowTask[] = []

    for (const rule of rules) {
      if (this.evaluateTrigger(rule.trigger, trigger, context)) {
        if (this.evaluateConditions(rule.conditions, context)) {
          const tasks = await this.executeActions(rule.actions, context)
          triggeredTasks.push(...tasks)

          // Update rule metrics
          await this.updateRuleMetrics(rule.id, true)
        }
      }
    }

    return triggeredTasks
  }

  private async getActiveRules(): Promise<AutomationRule[]> {
    // Return predefined automation rules
    return [
      {
        id: "critical_lab_alert",
        name: "Critical Lab Value Alert",
        trigger: {
          type: "lab_result",
          parameters: { category: "critical" },
        },
        actions: [
          {
            type: "create_task",
            parameters: {
              type: "alert",
              priority: "urgent",
              title: "Critical Lab Value Requires Immediate Attention",
              assignedTo: "attending_physician",
            },
          },
          {
            type: "send_notification",
            parameters: {
              recipients: ["attending_physician", "charge_nurse"],
              message: "Critical lab value detected for patient",
              urgency: "immediate",
            },
          },
        ],
        conditions: [
          {
            field: "value",
            operator: "greater_than",
            value: "critical_threshold",
          },
        ],
        isActive: true,
        successRate: 0.98,
        timeSaved: 15,
      },
      {
        id: "medication_reconciliation",
        name: "Automated Medication Reconciliation",
        trigger: {
          type: "appointment",
          parameters: { type: "admission" },
        },
        actions: [
          {
            type: "create_task",
            parameters: {
              type: "review",
              priority: "high",
              title: "Medication Reconciliation Required",
              assignedTo: "pharmacist",
            },
          },
          {
            type: "generate_document",
            parameters: {
              template: "medication_reconciliation_form",
              auto_populate: true,
            },
          },
        ],
        conditions: [],
        isActive: true,
        successRate: 0.95,
        timeSaved: 30,
      },
      {
        id: "discharge_planning",
        name: "Automated Discharge Planning",
        trigger: {
          type: "time_based",
          parameters: { days_before_discharge: 2 },
        },
        actions: [
          {
            type: "create_task",
            parameters: {
              type: "scheduling",
              priority: "medium",
              title: "Initiate Discharge Planning",
              assignedTo: "case_manager",
            },
          },
          {
            type: "create_task",
            parameters: {
              type: "documentation",
              priority: "medium",
              title: "Prepare Discharge Summary",
              assignedTo: "attending_physician",
            },
            delay: 60,
          },
        ],
        conditions: [
          {
            field: "length_of_stay",
            operator: "greater_than",
            value: 1,
          },
        ],
        isActive: true,
        successRate: 0.92,
        timeSaved: 45,
      },
    ]
  }

  private evaluateTrigger(ruleTrigger: TriggerCondition, actualTrigger: TriggerCondition, context: any): boolean {
    if (ruleTrigger.type !== actualTrigger.type) {
      return false
    }

    // Evaluate trigger-specific parameters
    switch (ruleTrigger.type) {
      case "lab_result":
        return this.evaluateLabTrigger(ruleTrigger.parameters, actualTrigger.parameters, context)
      case "vital_sign":
        return this.evaluateVitalTrigger(ruleTrigger.parameters, actualTrigger.parameters, context)
      case "appointment":
        return this.evaluateAppointmentTrigger(ruleTrigger.parameters, actualTrigger.parameters, context)
      default:
        return true
    }
  }

  private evaluateLabTrigger(ruleParams: any, triggerParams: any, context: any): boolean {
    if (ruleParams.category === "critical" && triggerParams.category === "critical") {
      return true
    }
    return false
  }

  private evaluateVitalTrigger(ruleParams: any, triggerParams: any, context: any): boolean {
    // Implementation for vital sign trigger evaluation
    return true
  }

  private evaluateAppointmentTrigger(ruleParams: any, triggerParams: any, context: any): boolean {
    return ruleParams.type === triggerParams.type
  }

  private evaluateConditions(conditions: RuleCondition[], context: any): boolean {
    return conditions.every((condition) => {
      const value = this.getContextValue(condition.field, context)
      return this.evaluateCondition(condition, value)
    })
  }

  private getContextValue(field: string, context: any): any {
    // Navigate nested object properties
    return field.split(".").reduce((obj, key) => obj?.[key], context)
  }

  private evaluateCondition(condition: RuleCondition, value: any): boolean {
    switch (condition.operator) {
      case "equals":
        return value === condition.value
      case "greater_than":
        return value > condition.value
      case "less_than":
        return value < condition.value
      case "contains":
        return String(value).includes(String(condition.value))
      case "not_equals":
        return value !== condition.value
      default:
        return false
    }
  }

  private async executeActions(actions: AutomationAction[], context: any): Promise<WorkflowTask[]> {
    const tasks: WorkflowTask[] = []

    for (const action of actions) {
      if (action.delay) {
        // Schedule delayed action
        setTimeout(() => this.executeAction(action, context), action.delay * 60 * 1000)
      } else {
        const task = await this.executeAction(action, context)
        if (task) tasks.push(task)
      }
    }

    return tasks
  }

  private async executeAction(action: AutomationAction, context: any): Promise<WorkflowTask | null> {
    switch (action.type) {
      case "create_task":
        return this.createTaskFromAction(action.parameters, context)
      case "send_notification":
        await this.sendNotification(action.parameters, context)
        return null
      case "update_record":
        await this.updateRecord(action.parameters, context)
        return null
      case "schedule_appointment":
        return this.scheduleAppointment(action.parameters, context)
      case "order_test":
        return this.orderTest(action.parameters, context)
      case "generate_document":
        return this.generateDocument(action.parameters, context)
      default:
        return null
    }
  }

  private async createTaskFromAction(parameters: any, context: any): Promise<WorkflowTask> {
    const task = await this.createTask({
      type: parameters.type,
      priority: parameters.priority,
      status: "pending",
      assignedTo: parameters.assignedTo,
      patientId: context.patientId,
      title: parameters.title,
      description: parameters.description || "",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default 24 hours
      estimatedDuration: parameters.estimatedDuration || 30,
      dependencies: [],
      automationLevel: "fully_automated",
    })

    return task
  }

  private async sendNotification(parameters: any, context: any): Promise<void> {
    // Implementation for sending notifications
    console.log(`Sending notification to ${parameters.recipients.join(", ")}: ${parameters.message}`)
  }

  private async updateRecord(parameters: any, context: any): Promise<void> {
    // Implementation for updating patient records
    console.log(`Updating record for patient ${context.patientId}`)
  }

  private async scheduleAppointment(parameters: any, context: any): Promise<WorkflowTask> {
    return this.createTask({
      type: "scheduling",
      priority: "medium",
      status: "pending",
      assignedTo: "scheduler",
      patientId: context.patientId,
      title: `Schedule ${parameters.appointmentType}`,
      description: `Automated scheduling request for ${parameters.appointmentType}`,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      estimatedDuration: 15,
      dependencies: [],
      automationLevel: "semi_automated",
    })
  }

  private async orderTest(parameters: any, context: any): Promise<WorkflowTask> {
    return this.createTask({
      type: "ordering",
      priority: "high",
      status: "pending",
      assignedTo: "physician",
      patientId: context.patientId,
      title: `Order ${parameters.testType}`,
      description: `Automated test order for ${parameters.testType}`,
      dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
      estimatedDuration: 10,
      dependencies: [],
      automationLevel: "semi_automated",
    })
  }

  private async generateDocument(parameters: any, context: any): Promise<WorkflowTask> {
    return this.createTask({
      type: "documentation",
      priority: "medium",
      status: "pending",
      assignedTo: "physician",
      patientId: context.patientId,
      title: `Generate ${parameters.template}`,
      description: `Auto-generated document using ${parameters.template} template`,
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
      estimatedDuration: 20,
      dependencies: [],
      automationLevel: "fully_automated",
    })
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async addToTaskQueue(task: WorkflowTask): Promise<void> {
    const queueKey = `task_queue:${task.priority}`
    await this.redis.lpush(queueKey, task.id)
  }

  private async updateRuleMetrics(ruleId: string, success: boolean): Promise<void> {
    const metricsKey = `rule_metrics:${ruleId}`
    const metrics = ((await this.redis.get(metricsKey)) as any) || { executions: 0, successes: 0 }

    metrics.executions++
    if (success) metrics.successes++

    await this.redis.setex(metricsKey, 86400 * 30, JSON.stringify(metrics))
  }

  async getTasksByUser(userId: string): Promise<WorkflowTask[]> {
    // Implementation to retrieve tasks assigned to a specific user
    const taskKeys = await this.redis.keys("task:*")
    const tasks: WorkflowTask[] = []

    for (const key of taskKeys) {
      const task = (await this.redis.get(key)) as WorkflowTask
      if (task && task.assignedTo === userId) {
        tasks.push(task)
      }
    }

    return tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }

  async updateTaskStatus(taskId: string, status: WorkflowTask["status"]): Promise<void> {
    const taskKey = `task:${taskId}`
    const task = (await this.redis.get(taskKey)) as WorkflowTask

    if (task) {
      task.status = status
      task.updatedAt = new Date().toISOString()
      await this.redis.setex(taskKey, 86400 * 7, JSON.stringify(task))
    }
  }

  async getWorkflowMetrics(): Promise<WorkflowMetrics> {
    const taskKeys = await this.redis.keys("task:*")
    const tasks: WorkflowTask[] = []

    for (const key of taskKeys) {
      const task = (await this.redis.get(key)) as WorkflowTask
      if (task) tasks.push(task)
    }

    const completedTasks = tasks.filter((t) => t.status === "completed")
    const automatedTasks = tasks.filter((t) => t.automationLevel === "fully_automated")

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      averageCompletionTime: this.calculateAverageCompletionTime(completedTasks),
      automationRate: automatedTasks.length / tasks.length,
      timeSaved: this.calculateTimeSaved(automatedTasks),
      errorRate: tasks.filter((t) => t.status === "failed").length / tasks.length,
      userSatisfaction: 0.92, // Mock value
    }
  }

  private calculateAverageCompletionTime(tasks: WorkflowTask[]): number {
    if (tasks.length === 0) return 0

    const totalTime = tasks.reduce((sum, task) => {
      const created = new Date(task.createdAt).getTime()
      const updated = new Date(task.updatedAt).getTime()
      return sum + (updated - created)
    }, 0)

    return totalTime / tasks.length / (1000 * 60) // Convert to minutes
  }

  private calculateTimeSaved(automatedTasks: WorkflowTask[]): number {
    return automatedTasks.reduce((sum, task) => sum + task.estimatedDuration, 0)
  }
}
