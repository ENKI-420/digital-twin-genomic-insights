import { type NextRequest, NextResponse } from "next/server"
import { TrialMatchingValidator } from "@/lib/validation/trial-matching-validator"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Starting trial matching validation...")

    const validator = new TrialMatchingValidator()
    const validation = await validator.runValidation()

    console.log("✅ Validation completed successfully")

    return NextResponse.json({
      success: true,
      validation,
      message: "Trial matching validation completed successfully",
    })
  } catch (error) {
    console.error("❌ Validation failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const validationId = searchParams.get("validationId")

    const validator = new TrialMatchingValidator()

    if (validationId) {
      const validation = await validator.getValidationResult(validationId)

      if (!validation) {
        return NextResponse.json({ success: false, error: "Validation not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        validation,
      })
    } else {
      const validationIds = await validator.listValidations()

      return NextResponse.json({
        success: true,
        validations: validationIds,
      })
    }
  } catch (error) {
    console.error("Failed to retrieve validation:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve validation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
