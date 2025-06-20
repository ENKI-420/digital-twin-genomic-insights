import type { MedicalReport } from "@/types/medical-reports"

export const MOCK_REPORTS: MedicalReport[] = [
  {
    id: "r1",
    patientId: "1",
    type: "laboratory",
    name: "Complete Blood Count",
    date: "2023-05-10",
    provider: "Dr. Jane Smith",
    status: "final",
    panels: [
      {
        name: "Complete Blood Count",
        category: "Hematology",
        results: [
          {
            name: "White Blood Cell Count",
            value: 7.2,
            unit: "10³/µL",
            referenceRange: "4.5-11.0",
            status: "normal",
            previousResults: [
              { value: 6.8, date: "2023-01-15" },
              { value: 7.5, date: "2022-09-22" },
              { value: 6.9, date: "2022-05-10" },
            ],
          },
          {
            name: "Red Blood Cell Count",
            value: 5.1,
            unit: "10⁶/µL",
            referenceRange: "4.5-5.9",
            status: "normal",
            previousResults: [
              { value: 5.0, date: "2023-01-15" },
              { value: 5.2, date: "2022-09-22" },
              { value: 5.0, date: "2022-05-10" },
            ],
          },
          {
            name: "Hemoglobin",
            value: 14.2,
            unit: "g/dL",
            referenceRange: "13.5-17.5",
            status: "normal",
            previousResults: [
              { value: 14.0, date: "2023-01-15" },
              { value: 14.5, date: "2022-09-22" },
              { value: 14.1, date: "2022-05-10" },
            ],
          },
          {
            name: "Hematocrit",
            value: 42.0,
            unit: "%",
            referenceRange: "41.0-53.0",
            status: "normal",
            previousResults: [
              { value: 41.5, date: "2023-01-15" },
              { value: 43.0, date: "2022-09-22" },
              { value: 42.2, date: "2022-05-10" },
            ],
          },
          {
            name: "Platelet Count",
            value: 250,
            unit: "10³/µL",
            referenceRange: "150-450",
            status: "normal",
            previousResults: [
              { value: 245, date: "2023-01-15" },
              { value: 260, date: "2022-09-22" },
              { value: 255, date: "2022-05-10" },
            ],
          },
        ],
      },
      {
        name: "Differential",
        category: "Hematology",
        results: [
          {
            name: "Neutrophils",
            value: 60,
            unit: "%",
            referenceRange: "40-70",
            status: "normal",
            previousResults: [
              { value: 58, date: "2023-01-15" },
              { value: 62, date: "2022-09-22" },
              { value: 59, date: "2022-05-10" },
            ],
          },
          {
            name: "Lymphocytes",
            value: 30,
            unit: "%",
            referenceRange: "20-40",
            status: "normal",
            previousResults: [
              { value: 32, date: "2023-01-15" },
              { value: 28, date: "2022-09-22" },
              { value: 31, date: "2022-05-10" },
            ],
          },
          {
            name: "Monocytes",
            value: 7,
            unit: "%",
            referenceRange: "2-10",
            status: "normal",
            previousResults: [
              { value: 6, date: "2023-01-15" },
              { value: 7, date: "2022-09-22" },
              { value: 6, date: "2022-05-10" },
            ],
          },
          {
            name: "Eosinophils",
            value: 2,
            unit: "%",
            referenceRange: "1-6",
            status: "normal",
            previousResults: [
              { value: 3, date: "2023-01-15" },
              { value: 2, date: "2022-09-22" },
              { value: 3, date: "2022-05-10" },
            ],
          },
          {
            name: "Basophils",
            value: 1,
            unit: "%",
            referenceRange: "0-2",
            status: "normal",
            previousResults: [
              { value: 1, date: "2023-01-15" },
              { value: 1, date: "2022-09-22" },
              { value: 1, date: "2022-05-10" },
            ],
          },
        ],
      },
    ],
    conclusion: "Complete blood count is within normal limits.",
    notes: "Patient fasting for 12 hours prior to blood draw.",
  },
  {
    id: "r2",
    patientId: "1",
    type: "laboratory",
    name: "Comprehensive Metabolic Panel",
    date: "2023-05-10",
    provider: "Dr. Jane Smith",
    status: "final",
    panels: [
      {
        name: "Electrolytes",
        category: "Chemistry",
        results: [
          {
            name: "Sodium",
            value: 142,
            unit: "mmol/L",
            referenceRange: "135-145",
            status: "normal",
            previousResults: [
              { value: 140, date: "2023-01-15" },
              { value: 141, date: "2022-09-22" },
              { value: 139, date: "2022-05-10" },
            ],
          },
          {
            name: "Potassium",
            value: 4.2,
            unit: "mmol/L",
            referenceRange: "3.5-5.0",
            status: "normal",
            previousResults: [
              { value: 4.0, date: "2023-01-15" },
              { value: 4.3, date: "2022-09-22" },
              { value: 4.1, date: "2022-05-10" },
            ],
          },
          {
            name: "Chloride",
            value: 104,
            unit: "mmol/L",
            referenceRange: "98-107",
            status: "normal",
            previousResults: [
              { value: 103, date: "2023-01-15" },
              { value: 105, date: "2022-09-22" },
              { value: 102, date: "2022-05-10" },
            ],
          },
          {
            name: "Carbon Dioxide",
            value: 24,
            unit: "mmol/L",
            referenceRange: "22-29",
            status: "normal",
            previousResults: [
              { value: 25, date: "2023-01-15" },
              { value: 24, date: "2022-09-22" },
              { value: 26, date: "2022-05-10" },
            ],
          },
        ],
      },
      {
        name: "Kidney Function",
        category: "Chemistry",
        results: [
          {
            name: "Blood Urea Nitrogen (BUN)",
            value: 15,
            unit: "mg/dL",
            referenceRange: "7-20",
            status: "normal",
            previousResults: [
              { value: 14, date: "2023-01-15" },
              { value: 16, date: "2022-09-22" },
              { value: 13, date: "2022-05-10" },
            ],
          },
          {
            name: "Creatinine",
            value: 0.9,
            unit: "mg/dL",
            referenceRange: "0.6-1.2",
            status: "normal",
            previousResults: [
              { value: 0.8, date: "2023-01-15" },
              { value: 0.9, date: "2022-09-22" },
              { value: 0.8, date: "2022-05-10" },
            ],
          },
          {
            name: "eGFR",
            value: 95,
            unit: "mL/min/1.73m²",
            referenceRange: ">60",
            status: "normal",
            previousResults: [
              { value: 97, date: "2023-01-15" },
              { value: 94, date: "2022-09-22" },
              { value: 96, date: "2022-05-10" },
            ],
          },
        ],
      },
      {
        name: "Liver Function",
        category: "Chemistry",
        results: [
          {
            name: "Albumin",
            value: 4.2,
            unit: "g/dL",
            referenceRange: "3.5-5.0",
            status: "normal",
            previousResults: [
              { value: 4.3, date: "2023-01-15" },
              { value: 4.1, date: "2022-09-22" },
              { value: 4.2, date: "2022-05-10" },
            ],
          },
          {
            name: "Total Bilirubin",
            value: 0.8,
            unit: "mg/dL",
            referenceRange: "0.1-1.2",
            status: "normal",
            previousResults: [
              { value: 0.7, date: "2023-01-15" },
              { value: 0.9, date: "2022-09-22" },
              { value: 0.8, date: "2022-05-10" },
            ],
          },
          {
            name: "Alkaline Phosphatase",
            value: 70,
            unit: "U/L",
            referenceRange: "40-129",
            status: "normal",
            previousResults: [
              { value: 68, date: "2023-01-15" },
              { value: 72, date: "2022-09-22" },
              { value: 69, date: "2022-05-10" },
            ],
          },
          {
            name: "AST",
            value: 25,
            unit: "U/L",
            referenceRange: "0-40",
            status: "normal",
            previousResults: [
              { value: 24, date: "2023-01-15" },
              { value: 26, date: "2022-09-22" },
              { value: 23, date: "2022-05-10" },
            ],
          },
          {
            name: "ALT",
            value: 30,
            unit: "U/L",
            referenceRange: "0-41",
            status: "normal",
            previousResults: [
              { value: 28, date: "2023-01-15" },
              { value: 32, date: "2022-09-22" },
              { value: 29, date: "2022-05-10" },
            ],
          },
        ],
      },
      {
        name: "Metabolic",
        category: "Chemistry",
        results: [
          {
            name: "Glucose",
            value: 105,
            unit: "mg/dL",
            referenceRange: "70-99",
            status: "abnormal",
            previousResults: [
              { value: 102, date: "2023-01-15" },
              { value: 98, date: "2022-09-22" },
              { value: 95, date: "2022-05-10" },
            ],
          },
          {
            name: "Calcium",
            value: 9.5,
            unit: "mg/dL",
            referenceRange: "8.5-10.2",
            status: "normal",
            previousResults: [
              { value: 9.4, date: "2023-01-15" },
              { value: 9.6, date: "2022-09-22" },
              { value: 9.3, date: "2022-05-10" },
            ],
          },
          {
            name: "Total Protein",
            value: 7.0,
            unit: "g/dL",
            referenceRange: "6.0-8.3",
            status: "normal",
            previousResults: [
              { value: 7.1, date: "2023-01-15" },
              { value: 6.9, date: "2022-09-22" },
              { value: 7.0, date: "2022-05-10" },
            ],
          },
        ],
      },
    ],
    conclusion:
      "Comprehensive metabolic panel is generally within normal limits, with a slightly elevated fasting glucose level. Consider follow-up testing for glucose metabolism.",
    notes: "Patient fasting for 12 hours prior to blood draw.",
  },
  {
    id: "r3",
    patientId: "1",
    type: "radiology",
    name: "Chest X-Ray",
    date: "2023-04-15",
    provider: "Dr. Robert Johnson",
    status: "final",
    clinicalInformation: "Annual check-up, no specific symptoms reported.",
    technique: "PA and lateral views of the chest were obtained.",
    findings:
      "Heart size is normal. Lungs are clear without evidence of infiltrate, effusion, or pneumothorax. No pleural effusion is seen. Mediastinal contours are normal. Visualized bony structures show no acute abnormality.",
    impression: "Normal chest radiograph. No acute cardiopulmonary process identified.",
    images: [
      {
        id: "img1",
        description: "PA view",
        url: "/chest-xray-pa.png",
      },
      {
        id: "img2",
        description: "Lateral view",
        url: "/chest-xray-lateral.png",
      },
    ],
  },
  {
    id: "r4",
    patientId: "1",
    type: "pathology",
    name: "Skin Biopsy",
    date: "2023-03-01",
    provider: "Dr. Lisa Chen",
    status: "final",
    clinicalInformation: "3mm punch biopsy of suspicious lesion on left forearm.",
    specimens: [
      {
        type: "Skin, left forearm",
        site: "Left forearm",
        collectionDate: "2023-02-28",
      },
    ],
    findings:
      "Sections show skin with mild acanthosis and hyperkeratosis. There is a mild perivascular lymphocytic infiltrate in the superficial dermis. No evidence of malignancy or atypia is identified.",
    impression: "Consistent with benign inflammatory dermatosis, suggestive of eczematous dermatitis.",
    conclusion: "Benign inflammatory skin condition. No evidence of malignancy.",
    recommendations: "Clinical correlation recommended. Consider topical steroids if symptomatic.",
    images: [
      {
        id: "img3",
        description: "Microscopic view, H&E stain, 10x",
        url: "/skin-biopsy-he.png",
      },
    ],
  },
  {
    id: "r5",
    patientId: "1",
    type: "laboratory",
    name: "Lipid Panel",
    date: "2023-02-15",
    provider: "Dr. Jane Smith",
    status: "final",
    panels: [
      {
        name: "Lipid Panel",
        category: "Chemistry",
        results: [
          {
            name: "Total Cholesterol",
            value: 210,
            unit: "mg/dL",
            referenceRange: "<200",
            status: "abnormal",
            previousResults: [
              { value: 205, date: "2022-08-10" },
              { value: 195, date: "2022-02-15" },
              { value: 190, date: "2021-08-20" },
            ],
          },
          {
            name: "Triglycerides",
            value: 150,
            unit: "mg/dL",
            referenceRange: "<150",
            status: "normal",
            previousResults: [
              { value: 145, date: "2022-08-10" },
              { value: 140, date: "2022-02-15" },
              { value: 135, date: "2021-08-20" },
            ],
          },
          {
            name: "HDL Cholesterol",
            value: 45,
            unit: "mg/dL",
            referenceRange: ">40",
            status: "normal",
            previousResults: [
              { value: 44, date: "2022-08-10" },
              { value: 46, date: "2022-02-15" },
              { value: 45, date: "2021-08-20" },
            ],
          },
          {
            name: "LDL Cholesterol",
            value: 135,
            unit: "mg/dL",
            referenceRange: "<130",
            status: "abnormal",
            previousResults: [
              { value: 132, date: "2022-08-10" },
              { value: 125, date: "2022-02-15" },
              { value: 120, date: "2021-08-20" },
            ],
          },
          {
            name: "Non-HDL Cholesterol",
            value: 165,
            unit: "mg/dL",
            referenceRange: "<160",
            status: "abnormal",
            previousResults: [
              { value: 161, date: "2022-08-10" },
              { value: 149, date: "2022-02-15" },
              { value: 145, date: "2021-08-20" },
            ],
          },
        ],
      },
    ],
    conclusion:
      "Borderline elevated total cholesterol and LDL cholesterol. Consider lifestyle modifications including diet and exercise. Repeat lipid panel in 6 months.",
    notes: "Patient fasting for 12 hours prior to blood draw.",
  },
]

export function getMockReport(reportId: string): MedicalReport | undefined {
  return MOCK_REPORTS.find((report) => report.id === reportId)
}

export function getMockReportsForPatient(patientId: string): MedicalReport[] {
  return MOCK_REPORTS.filter((report) => report.patientId === patientId)
}
