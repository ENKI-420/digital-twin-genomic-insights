import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const { patientId, twinData, config } = await request.json()

    // Cache visualization data for performance
    const cacheKey = `3d_viz:${patientId}:${Date.now()}`
    await redis.setex(cacheKey, 3600, JSON.stringify({ twinData, config }))

    // Process 3D visualization request
    const processedData = await process3DVisualization(twinData, config)

    return NextResponse.json({
      success: true,
      data: processedData,
      cacheKey,
    })
  } catch (error) {
    console.error("3D visualization processing failed:", error)
    return NextResponse.json({ error: "Failed to process 3D visualization" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cacheKey = searchParams.get("cacheKey")

    if (cacheKey) {
      const cachedData = await redis.get(cacheKey)
      if (cachedData) {
        return NextResponse.json({
          success: true,
          data: cachedData,
        })
      }
    }

    return NextResponse.json({ error: "Cached data not found" }, { status: 404 })
  } catch (error) {
    console.error("Failed to retrieve cached visualization:", error)
    return NextResponse.json({ error: "Failed to retrieve visualization data" }, { status: 500 })
  }
}

async function process3DVisualization(twinData: any[], config: any) {
  // **[I] Integration & Interoperability** - Process data for 3D visualization
  const processedData = {
    variants: [],
    chromosomes: [],
    connections: [],
    metadata: {
      processingTime: Date.now(),
      variantCount: 0,
      qualityMetrics: {},
    },
  }

  // Process each twin dataset
  for (const twin of twinData) {
    // Optimize variant data for 3D rendering
    const optimizedVariants = twin.variants.map((variant: any) => ({
      ...variant,
      coordinates: calculateVariant3DPosition(variant, twin.chromosomes),
      renderPriority: calculateRenderPriority(variant),
      lodLevel: calculateLODLevel(variant, config),
    }))

    processedData.variants.push(...optimizedVariants)
    processedData.metadata.variantCount += optimizedVariants.length
  }

  // Generate chromosome structures for 3D rendering
  processedData.chromosomes = generateChromosome3DStructures(twinData)

  // Calculate variant connections for twin comparison
  if (twinData.length > 1) {
    processedData.connections = calculateVariantConnections(twinData)
  }

  return processedData
}

function calculateVariant3DPosition(variant: any, chromosomes: any[]) {
  const chromosome = chromosomes.find((chr) => chr.number === variant.chromosome)
  if (!chromosome) return { x: 0, y: 0, z: 0 }

  // Map genomic position to 3D coordinates
  const relativePosition = variant.position / chromosome.length
  const chromosomeIndex = Number.parseInt(chromosome.number) - 1

  return {
    x: ((chromosomeIndex % 6) - 2.5) * 8, // Grid layout
    y: (relativePosition - 0.5) * (chromosome.length / 1000000),
    z: Math.floor(chromosomeIndex / 6) * 8,
  }
}

function calculateRenderPriority(variant: any): number {
  // Higher priority for pathogenic variants
  const significanceWeight = {
    pathogenic: 1.0,
    likely_pathogenic: 0.8,
    vus: 0.5,
    likely_benign: 0.2,
    benign: 0.1,
  }

  const qualityWeight = variant.quality / 100
  const frequencyWeight = 1 - variant.alleleFrequency

  return (significanceWeight[variant.significance] || 0.5) * qualityWeight * frequencyWeight
}

function calculateLODLevel(variant: any, config: any): number {
  // Level of detail for performance optimization
  const priority = calculateRenderPriority(variant)

  if (priority > 0.8) return 0 // Highest detail
  if (priority > 0.5) return 1 // Medium detail
  if (priority > 0.2) return 2 // Low detail
  return 3 // Minimal detail
}

function generateChromosome3DStructures(twinData: any[]) {
  const structures = []

  for (const twin of twinData) {
    for (const chromosome of twin.chromosomes) {
      structures.push({
        twinId: twin.twinId,
        chromosome: chromosome.number,
        structure: {
          length: chromosome.length,
          bands: chromosome.bands,
          centromere: chromosome.centromerePosition,
          geometry: generateChromosomeGeometry(chromosome),
          material: generateChromosomeMaterial(chromosome),
        },
      })
    }
  }

  return structures
}

function generateChromosomeGeometry(chromosome: any) {
  // Generate 3D geometry data for chromosome
  return {
    type: "cylinder",
    height: chromosome.length / 1000000,
    radius: 0.5,
    segments: 16,
    bands: chromosome.bands.map((band: any) => ({
      start: band.start / chromosome.length,
      end: band.end / chromosome.length,
      color: getBandColor(band.stain),
    })),
  }
}

function generateChromosomeMaterial(chromosome: any) {
  // Generate material properties for chromosome rendering
  return {
    type: "phong",
    opacity: 0.8,
    transparent: true,
    shininess: 30,
    texture: generateBandTexture(chromosome.bands),
  }
}

function calculateVariantConnections(twinData: any[]) {
  const connections = []

  if (twinData.length < 2) return connections

  const [twin1, twin2] = twinData

  // Find matching variants between twins
  for (const variant1 of twin1.variants) {
    const matchingVariant = twin2.variants.find(
      (v2: any) => v2.chromosome === variant1.chromosome && Math.abs(v2.position - variant1.position) < 1000,
    )

    if (matchingVariant) {
      connections.push({
        variant1: variant1.id,
        variant2: matchingVariant.id,
        similarity: calculateVariantSimilarity(variant1, matchingVariant),
        connectionType: getConnectionType(variant1, matchingVariant),
      })
    }
  }

  return connections
}

function calculateVariantSimilarity(variant1: any, variant2: any): number {
  let similarity = 0

  // Type similarity
  if (variant1.type === variant2.type) similarity += 0.3

  // Significance similarity
  if (variant1.significance === variant2.significance) similarity += 0.4

  // Quality similarity
  const qualityDiff = Math.abs(variant1.quality - variant2.quality) / 100
  similarity += (1 - qualityDiff) * 0.2

  // Frequency similarity
  const freqDiff = Math.abs(variant1.alleleFrequency - variant2.alleleFrequency)
  similarity += (1 - freqDiff) * 0.1

  return Math.min(similarity, 1.0)
}

function getConnectionType(variant1: any, variant2: any): string {
  if (variant1.significance === variant2.significance && variant1.type === variant2.type) {
    return "identical"
  } else if (variant1.significance === variant2.significance) {
    return "similar_significance"
  } else if (variant1.type === variant2.type) {
    return "similar_type"
  } else {
    return "different"
  }
}

function getBandColor(stain: string): string {
  const colors = {
    gneg: "#ffffff",
    gpos25: "#cccccc",
    gpos50: "#999999",
    gpos75: "#666666",
    gpos100: "#333333",
    acen: "#ff0000",
    gvar: "#00ff00",
    stalk: "#0000ff",
  }
  return colors[stain] || "#ffffff"
}

function generateBandTexture(bands: any[]): string {
  // Generate base64 texture data for chromosome bands
  const canvas = document.createElement?.("canvas") || { width: 256, height: 1024 }
  // In a real implementation, this would generate actual texture data
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
}
