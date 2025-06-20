import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer"

export interface GenomicTwinData {
  twinId: string
  patientId: string
  chromosomes: ChromosomeData[]
  variants: GenomicVariant3D[]
  metadata: {
    sequencingDate: string
    platform: string
    coverage: number
    quality: number
  }
}

export interface ChromosomeData {
  number: string
  length: number
  centromerePosition: number
  bands: ChromosomeBand[]
  variants: GenomicVariant3D[]
}

export interface ChromosomeBand {
  name: string
  start: number
  end: number
  stain: "gneg" | "gpos25" | "gpos50" | "gpos75" | "gpos100" | "acen" | "gvar" | "stalk"
}

export interface GenomicVariant3D {
  id: string
  chromosome: string
  position: number
  type: "SNV" | "INDEL" | "CNV" | "SV" | "STR"
  significance: "pathogenic" | "likely_pathogenic" | "vus" | "likely_benign" | "benign"
  gene?: string
  consequence?: string
  alleleFrequency: number
  zygosity: "homozygous" | "heterozygous" | "hemizygous"
  quality: number
  depth: number
  coordinates?: THREE.Vector3
  mesh?: THREE.Mesh
  highlighted?: boolean
  selected?: boolean
}

export interface VisualizationConfig {
  mode: "3d_chromosomes" | "heatmap" | "scatter_plot" | "comparison_view"
  colorScheme: "significance" | "frequency" | "quality" | "zygosity"
  showLabels: boolean
  showConnections: boolean
  animationSpeed: number
  filterCriteria: {
    minQuality: number
    maxFrequency: number
    significanceFilter: string[]
    chromosomeFilter: string[]
  }
}

export class GenomicVisualizationEngine {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private labelRenderer: CSS2DRenderer
  private controls: OrbitControls
  private container: HTMLElement
  private animationId: number | null = null

  // Data management
  private twinDatasets: Map<string, GenomicTwinData> = new Map()
  private chromosomeMeshes: Map<string, THREE.Group> = new Map()
  private variantMeshes: Map<string, THREE.Mesh> = new Map()
  private connectionLines: THREE.Group = new THREE.Group()

  // Interaction state
  private selectedVariants: Set<string> = new Set()
  private highlightedRegions: Map<string, THREE.Mesh> = new Map()
  private raycaster: THREE.Raycaster = new THREE.Raycaster()
  private mouse: THREE.Vector2 = new THREE.Vector2()

  // Configuration
  private config: VisualizationConfig
  private isInitialized = false

  constructor(container: HTMLElement, config: VisualizationConfig) {
    this.container = container
    this.config = config
    this.initializeEngine()
  }

  private initializeEngine(): void {
    // Scene setup
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a0a0a)
    this.scene.fog = new THREE.Fog(0x0a0a0a, 100, 1000)

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 2000)
    this.camera.position.set(0, 50, 100)

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.container.appendChild(this.renderer.domElement)

    // Label renderer for annotations
    this.labelRenderer = new CSS2DRenderer()
    this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.labelRenderer.domElement.style.position = "absolute"
    this.labelRenderer.domElement.style.top = "0px"
    this.labelRenderer.domElement.style.pointerEvents = "none"
    this.container.appendChild(this.labelRenderer.domElement)

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.maxDistance = 500
    this.controls.minDistance = 10

    // Lighting
    this.setupLighting()

    // Event listeners
    this.setupEventListeners()

    // Add connection lines group
    this.scene.add(this.connectionLines)

    this.isInitialized = true
    this.startRenderLoop()
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(ambientLight)

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(50, 50, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)

    // Point lights for accent
    const pointLight1 = new THREE.PointLight(0x0066cc, 0.5, 100)
    pointLight1.position.set(-50, 30, 50)
    this.scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xcc6600, 0.5, 100)
    pointLight2.position.set(50, 30, -50)
    this.scene.add(pointLight2)
  }

  private setupEventListeners(): void {
    // Mouse interaction
    this.renderer.domElement.addEventListener("mousemove", this.onMouseMove.bind(this))
    this.renderer.domElement.addEventListener("click", this.onMouseClick.bind(this))

    // Resize handling
    window.addEventListener("resize", this.onWindowResize.bind(this))

    // Keyboard shortcuts
    window.addEventListener("keydown", this.onKeyDown.bind(this))
  }

  public loadTwinData(twinData: GenomicTwinData[]): void {
    // Clear existing data
    this.clearVisualization()

    // Load each twin dataset
    twinData.forEach((data, index) => {
      this.twinDatasets.set(data.twinId, data)
      this.createTwinVisualization(data, index)
    })

    // Create comparison connections if multiple twins
    if (twinData.length > 1) {
      this.createTwinComparisons(twinData)
    }

    // Fit camera to view all data
    this.fitCameraToData()
  }

  private createTwinVisualization(twinData: GenomicTwinData, twinIndex: number): void {
    const twinGroup = new THREE.Group()
    twinGroup.name = `twin_${twinData.twinId}`

    // Position twins side by side
    const spacing = 150
    twinGroup.position.x = (twinIndex - 0.5) * spacing

    switch (this.config.mode) {
      case "3d_chromosomes":
        this.create3DChromosomes(twinData, twinGroup)
        break
      case "heatmap":
        this.createHeatmapVisualization(twinData, twinGroup)
        break
      case "scatter_plot":
        this.createScatterPlot(twinData, twinGroup)
        break
      case "comparison_view":
        this.createComparisonView(twinData, twinGroup, twinIndex)
        break
    }

    this.scene.add(twinGroup)
    this.chromosomeMeshes.set(twinData.twinId, twinGroup)
  }

  private create3DChromosomes(twinData: GenomicTwinData, parentGroup: THREE.Group): void {
    const chromosomeSpacing = 8
    const chromosomesPerRow = 6

    twinData.chromosomes.forEach((chromosome, index) => {
      const chromosomeGroup = new THREE.Group()

      // Position chromosomes in a grid
      const row = Math.floor(index / chromosomesPerRow)
      const col = index % chromosomesPerRow
      chromosomeGroup.position.set((col - chromosomesPerRow / 2) * chromosomeSpacing, -row * chromosomeSpacing, 0)

      // Create chromosome structure
      const chromosomeMesh = this.createChromosomeMesh(chromosome)
      chromosomeGroup.add(chromosomeMesh)

      // Add variants as particles/spheres
      chromosome.variants.forEach((variant) => {
        const variantMesh = this.createVariantMesh(variant, chromosome)
        chromosomeGroup.add(variantMesh)
        this.variantMeshes.set(variant.id, variantMesh)
      })

      // Add chromosome label
      if (this.config.showLabels) {
        const label = this.createChromosomeLabel(chromosome.number)
        chromosomeGroup.add(label)
      }

      parentGroup.add(chromosomeGroup)
    })
  }

  private createChromosomeMesh(chromosome: ChromosomeData): THREE.Mesh {
    // Create chromosome as a cylindrical structure with bands
    const height = chromosome.length / 1000000 // Scale down
    const radius = 0.5

    const geometry = new THREE.CylinderGeometry(radius, radius, height, 16)

    // Create material with banding pattern
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 1024
    const context = canvas.getContext("2d")!

    // Draw chromosome bands
    chromosome.bands.forEach((band) => {
      const startY = (band.start / chromosome.length) * canvas.height
      const endY = (band.end / chromosome.length) * canvas.height

      context.fillStyle = this.getBandColor(band.stain)
      context.fillRect(0, startY, canvas.width, endY - startY)
    })

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true

    return mesh
  }

  private createVariantMesh(variant: GenomicVariant3D, chromosome: ChromosomeData): THREE.Mesh {
    const size = this.getVariantSize(variant)
    const color = this.getVariantColor(variant)

    let geometry: THREE.BufferGeometry

    switch (variant.type) {
      case "SNV":
        geometry = new THREE.SphereGeometry(size, 8, 8)
        break
      case "INDEL":
        geometry = new THREE.BoxGeometry(size, size * 2, size)
        break
      case "CNV":
        geometry = new THREE.ConeGeometry(size, size * 3, 6)
        break
      case "SV":
        geometry = new THREE.OctahedronGeometry(size)
        break
      default:
        geometry = new THREE.SphereGeometry(size, 8, 8)
    }

    const material = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      emissive: color,
      emissiveIntensity: 0.1,
    })

    const mesh = new THREE.Mesh(geometry, material)

    // Position variant along chromosome
    const chromosomeHeight = chromosome.length / 1000000
    const relativePosition = variant.position / chromosome.length
    mesh.position.y = (relativePosition - 0.5) * chromosomeHeight
    mesh.position.x = Math.random() * 2 - 1 // Slight random offset
    mesh.position.z = Math.random() * 2 - 1

    // Store variant data
    mesh.userData = { variant, chromosome }

    return mesh
  }

  private createHeatmapVisualization(twinData: GenomicTwinData, parentGroup: THREE.Group): void {
    const gridSize = 50
    const cellSize = 2

    // Create heatmap grid
    const heatmapData = this.generateHeatmapData(twinData, gridSize)

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const value = heatmapData[x][y]
        if (value > 0) {
          const geometry = new THREE.BoxGeometry(cellSize, cellSize, value * 10)
          const material = new THREE.MeshPhongMaterial({
            color: this.getHeatmapColor(value),
          })

          const mesh = new THREE.Mesh(geometry, material)
          mesh.position.set((x - gridSize / 2) * cellSize, (y - gridSize / 2) * cellSize, value * 5)

          parentGroup.add(mesh)
        }
      }
    }
  }

  private createScatterPlot(twinData: GenomicTwinData, parentGroup: THREE.Group): void {
    const pointsGeometry = new THREE.BufferGeometry()
    const positions: number[] = []
    const colors: number[] = []

    twinData.variants.forEach((variant) => {
      // Map variant properties to 3D coordinates
      const x = variant.position / 1000000 // Genomic position
      const y = variant.alleleFrequency * 100 // Allele frequency
      const z = variant.quality // Quality score

      positions.push(x, y, z)

      const color = new THREE.Color(this.getVariantColor(variant))
      colors.push(color.r, color.g, color.b)
    })

    pointsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    pointsGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))

    const pointsMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    })

    const points = new THREE.Points(pointsGeometry, pointsMaterial)
    parentGroup.add(points)
  }

  private createComparisonView(twinData: GenomicTwinData, parentGroup: THREE.Group, twinIndex: number): void {
    // Create side-by-side comparison with difference highlighting
    this.create3DChromosomes(twinData, parentGroup)

    // Add comparison-specific elements
    if (twinIndex > 0) {
      this.highlightDifferences(twinData, parentGroup)
    }
  }

  private createTwinComparisons(twinDataArray: GenomicTwinData[]): void {
    if (twinDataArray.length < 2) return

    const [twin1, twin2] = twinDataArray

    // Find matching variants and create connections
    twin1.variants.forEach((variant1) => {
      const matchingVariant = twin2.variants.find(
        (v2) => v2.chromosome === variant1.chromosome && Math.abs(v2.position - variant1.position) < 1000, // Within 1kb
      )

      if (matchingVariant) {
        this.createVariantConnection(variant1, matchingVariant)
      }
    })
  }

  private createVariantConnection(variant1: GenomicVariant3D, variant2: GenomicVariant3D): void {
    const mesh1 = this.variantMeshes.get(variant1.id)
    const mesh2 = this.variantMeshes.get(variant2.id)

    if (mesh1 && mesh2) {
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array([
        mesh1.position.x,
        mesh1.position.y,
        mesh1.position.z,
        mesh2.position.x,
        mesh2.position.y,
        mesh2.position.z,
      ])

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

      const material = new THREE.LineBasicMaterial({
        color: this.getConnectionColor(variant1, variant2),
        transparent: true,
        opacity: 0.6,
      })

      const line = new THREE.Line(geometry, material)
      this.connectionLines.add(line)
    }
  }

  private onMouseMove(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Raycast for hover effects
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.scene.children, true)

    // Reset previous hover states
    this.variantMeshes.forEach((mesh) => {
      if (mesh.userData.variant && !mesh.userData.variant.selected) {
        ;(mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.1
      }
    })

    // Highlight hovered variant
    if (intersects.length > 0) {
      const intersected = intersects[0].object as THREE.Mesh
      if (intersected.userData.variant) {
        ;(intersected.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.3
        this.showVariantTooltip(intersected.userData.variant, event)
      }
    }
  }

  private onMouseClick(event: MouseEvent): void {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.scene.children, true)

    if (intersects.length > 0) {
      const intersected = intersects[0].object as THREE.Mesh
      if (intersected.userData.variant) {
        this.selectVariant(intersected.userData.variant.id)
      }
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case "KeyR":
        this.resetCamera()
        break
      case "KeyF":
        this.fitCameraToData()
        break
      case "KeyH":
        this.toggleHighlights()
        break
      case "KeyL":
        this.config.showLabels = !this.config.showLabels
        this.updateVisualization()
        break
      case "Escape":
        this.clearSelection()
        break
    }
  }

  private onWindowResize(): void {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
    this.labelRenderer.setSize(width, height)
  }

  public selectVariant(variantId: string): void {
    const mesh = this.variantMeshes.get(variantId)
    if (mesh) {
      this.selectedVariants.add(variantId)
      mesh.userData.variant.selected = true
      ;(mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.5

      // Emit selection event
      this.container.dispatchEvent(
        new CustomEvent("variantSelected", {
          detail: { variant: mesh.userData.variant },
        }),
      )
    }
  }

  public highlightRegion(chromosome: string, start: number, end: number): void {
    const regionId = `${chromosome}_${start}_${end}`

    // Create highlight geometry
    const geometry = new THREE.BoxGeometry(2, (end - start) / 1000000, 2)
    const material = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.3,
    })

    const highlightMesh = new THREE.Mesh(geometry, material)

    // Position highlight on chromosome
    const chromosomeGroup = Array.from(this.chromosomeMeshes.values()).find((group) =>
      group.children.some((child) => child.userData.chromosome?.number === chromosome),
    )

    if (chromosomeGroup) {
      highlightMesh.position.copy(chromosomeGroup.position)
      highlightMesh.position.y += (start + end) / 2 / 1000000 - 50
      this.scene.add(highlightMesh)
      this.highlightedRegions.set(regionId, highlightMesh)
    }
  }

  public filterVariants(criteria: Partial<VisualizationConfig["filterCriteria"]>): void {
    Object.assign(this.config.filterCriteria, criteria)

    this.variantMeshes.forEach((mesh, variantId) => {
      const variant = mesh.userData.variant
      const visible = this.shouldShowVariant(variant)
      mesh.visible = visible
    })
  }

  public exportVisualization(format: "png" | "json" | "csv"): string | Blob {
    switch (format) {
      case "png":
        this.renderer.render(this.scene, this.camera)
        return this.renderer.domElement.toBlob!
      case "json":
        return JSON.stringify({
          twinData: Array.from(this.twinDatasets.values()),
          config: this.config,
          selectedVariants: Array.from(this.selectedVariants),
        })
      case "csv":
        return this.generateCSVExport()
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  public updateConfiguration(newConfig: Partial<VisualizationConfig>): void {
    Object.assign(this.config, newConfig)
    this.updateVisualization()
  }

  private updateVisualization(): void {
    // Clear and recreate visualization with new config
    const twinData = Array.from(this.twinDatasets.values())
    this.loadTwinData(twinData)
  }

  private clearVisualization(): void {
    // Remove all twin groups
    this.chromosomeMeshes.forEach((group) => {
      this.scene.remove(group)
    })
    this.chromosomeMeshes.clear()
    this.variantMeshes.clear()
    this.selectedVariants.clear()

    // Clear connections
    this.connectionLines.clear()

    // Clear highlights
    this.highlightedRegions.forEach((mesh) => {
      this.scene.remove(mesh)
    })
    this.highlightedRegions.clear()
  }

  private startRenderLoop(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate)

      this.controls.update()
      this.renderer.render(this.scene, this.camera)
      this.labelRenderer.render(this.scene, this.camera)
    }
    animate()
  }

  public dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    this.clearVisualization()
    this.renderer.dispose()
    this.labelRenderer.domElement.remove()
    this.container.removeChild(this.renderer.domElement)
  }

  // Helper methods
  private getBandColor(stain: ChromosomeBand["stain"]): string {
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

  private getVariantSize(variant: GenomicVariant3D): number {
    const baseSize = 0.3
    const qualityMultiplier = variant.quality / 100
    return baseSize * (0.5 + qualityMultiplier)
  }

  private getVariantColor(variant: GenomicVariant3D): number {
    switch (this.config.colorScheme) {
      case "significance":
        return this.getSignificanceColor(variant.significance)
      case "frequency":
        return this.getFrequencyColor(variant.alleleFrequency)
      case "quality":
        return this.getQualityColor(variant.quality)
      case "zygosity":
        return this.getZygosityColor(variant.zygosity)
      default:
        return 0x0066cc
    }
  }

  private getSignificanceColor(significance: GenomicVariant3D["significance"]): number {
    const colors = {
      pathogenic: 0xff0000,
      likely_pathogenic: 0xff6600,
      vus: 0xffff00,
      likely_benign: 0x66ff66,
      benign: 0x00ff00,
    }
    return colors[significance] || 0x888888
  }

  private getFrequencyColor(frequency: number): number {
    // Blue (rare) to red (common)
    const hue = ((1 - frequency) * 240) / 360
    return new THREE.Color().setHSL(hue, 1, 0.5).getHex()
  }

  private getQualityColor(quality: number): number {
    // Red (low) to green (high)
    const hue = ((quality / 100) * 120) / 360
    return new THREE.Color().setHSL(hue, 1, 0.5).getHex()
  }

  private getZygosityColor(zygosity: GenomicVariant3D["zygosity"]): number {
    const colors = {
      homozygous: 0xff0000,
      heterozygous: 0x0066cc,
      hemizygous: 0x9900cc,
    }
    return colors[zygosity] || 0x888888
  }

  private getHeatmapColor(value: number): number {
    // Heat map from blue to red
    const hue = ((1 - value) * 240) / 360
    return new THREE.Color().setHSL(hue, 1, 0.5).getHex()
  }

  private getConnectionColor(variant1: GenomicVariant3D, variant2: GenomicVariant3D): number {
    // Color based on similarity
    const significanceMatch = variant1.significance === variant2.significance
    const typeMatch = variant1.type === variant2.type

    if (significanceMatch && typeMatch) return 0x00ff00
    if (significanceMatch || typeMatch) return 0xffff00
    return 0xff0000
  }

  private generateHeatmapData(twinData: GenomicTwinData, gridSize: number): number[][] {
    const data: number[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(0))

    twinData.variants.forEach((variant) => {
      const x = Math.floor((variant.position / 300000000) * gridSize)
      const y = Math.floor(variant.alleleFrequency * gridSize)

      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        data[x][y] += 1
      }
    })

    // Normalize
    const max = Math.max(...data.flat())
    if (max > 0) {
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          data[x][y] /= max
        }
      }
    }

    return data
  }

  private shouldShowVariant(variant: GenomicVariant3D): boolean {
    const { filterCriteria } = this.config

    if (variant.quality < filterCriteria.minQuality) return false
    if (variant.alleleFrequency > filterCriteria.maxFrequency) return false
    if (
      filterCriteria.significanceFilter.length > 0 &&
      !filterCriteria.significanceFilter.includes(variant.significance)
    )
      return false
    if (filterCriteria.chromosomeFilter.length > 0 && !filterCriteria.chromosomeFilter.includes(variant.chromosome))
      return false

    return true
  }

  private createChromosomeLabel(chromosomeNumber: string): CSS2DObject {
    const labelDiv = document.createElement("div")
    labelDiv.className = "chromosome-label"
    labelDiv.textContent = `Chr ${chromosomeNumber}`
    labelDiv.style.color = "white"
    labelDiv.style.fontSize = "12px"
    labelDiv.style.fontFamily = "Arial, sans-serif"
    labelDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
    labelDiv.style.padding = "2px 6px"
    labelDiv.style.borderRadius = "3px"

    const label = new CSS2DObject(labelDiv)
    label.position.set(0, 0, 2)

    return label
  }

  private showVariantTooltip(variant: GenomicVariant3D, event: MouseEvent): void {
    // Implementation would show tooltip with variant details
    console.log("Variant tooltip:", variant)
  }

  private fitCameraToData(): void {
    const box = new THREE.Box3()
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        box.expandByObject(object)
      }
    })

    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)

    this.camera.position.copy(center)
    this.camera.position.z += maxDim * 2
    this.controls.target.copy(center)
    this.controls.update()
  }

  private resetCamera(): void {
    this.camera.position.set(0, 50, 100)
    this.controls.target.set(0, 0, 0)
    this.controls.update()
  }

  private toggleHighlights(): void {
    this.highlightedRegions.forEach((mesh) => {
      mesh.visible = !mesh.visible
    })
  }

  private clearSelection(): void {
    this.selectedVariants.clear()
    this.variantMeshes.forEach((mesh) => {
      mesh.userData.variant.selected = false
      ;(mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.1
    })
  }

  private highlightDifferences(twinData: GenomicTwinData, parentGroup: THREE.Group): void {
    // Implementation for highlighting differences between twins
    // This would compare variants and highlight unique ones
  }

  private generateCSVExport(): string {
    const headers = ["Twin ID", "Chromosome", "Position", "Type", "Significance", "Gene", "Quality", "Frequency"]
    const rows = [headers.join(",")]

    this.twinDatasets.forEach((twinData) => {
      twinData.variants.forEach((variant) => {
        const row = [
          twinData.twinId,
          variant.chromosome,
          variant.position,
          variant.type,
          variant.significance,
          variant.gene || "",
          variant.quality,
          variant.alleleFrequency,
        ]
        rows.push(row.join(","))
      })
    })

    return rows.join("\n")
  }
}
