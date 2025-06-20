import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer"

export interface ProteinStructure {
  id: string
  gene: string
  name: string
  pdbId?: string
  sequence: string
  domains: ProteinDomain[]
  variants: ProteinVariant[]
  interactions: MolecularInteraction[]
  structure?: {
    atoms: Atom[]
    bonds: Bond[]
    secondaryStructure: SecondaryStructure[]
  }
}

export interface ProteinDomain {
  id: string
  name: string
  type: 'binding' | 'catalytic' | 'structural' | 'regulatory'
  startPosition: number
  endPosition: number
  description: string
  color?: string
}

export interface ProteinVariant {
  id: string
  position: number
  referenceAA: string
  alternateAA: string
  impact: 'high' | 'moderate' | 'low' | 'benign'
  clinicalSignificance: 'pathogenic' | 'likely_pathogenic' | 'vus' | 'likely_benign' | 'benign'
  consequence: string
  coordinates?: THREE.Vector3
  mesh?: THREE.Mesh
  highlighted?: boolean
  selected?: boolean
  hgvs: string
}

export interface MolecularInteraction {
  id: string
  type: 'hydrogen_bond' | 'salt_bridge' | 'hydrophobic' | 'van_der_waals' | 'pi_stacking'
  atom1: Atom
  atom2: Atom
  distance: number
  energy?: number
  visible: boolean
}

export interface Atom {
  id: string
  element: string
  position: THREE.Vector3
  residue: string
  residueNumber: number
  chain: string
  bFactor?: number
  occupancy?: number
}

export interface Bond {
  id: string
  atom1Id: string
  atom2Id: string
  type: 'single' | 'double' | 'triple' | 'aromatic'
  order: number
}

export interface SecondaryStructure {
  id: string
  type: 'helix' | 'sheet' | 'loop' | 'turn'
  startResidue: number
  endResidue: number
  chain: string
}

export interface VisualizationSettings {
  colorScheme: 'cpk' | 'chain' | 'secondary' | 'hydrophobicity' | 'conservation' | 'impact'
  representation: 'cartoon' | 'spacefill' | 'stick' | 'wireframe' | 'surface'
  transparency: number
  showLabels: boolean
  showHydrogenBonds: boolean
  showSideChains: boolean
  showWaterMolecules: boolean
  showVariants: boolean
  variantImpactFilter: string[]
  rotationSpeed: number
  enableAnimation: boolean
}

export class ProteinStructureEngine {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private labelRenderer: CSS2DRenderer
  private controls: OrbitControls
  private container: HTMLElement
  private animationId: number | null = null

  // Structure data
  private currentProtein: ProteinStructure | null = null
  private atomMeshes: Map<string, THREE.Mesh> = new Map()
  private variantMeshes: Map<string, THREE.Mesh> = new Map()
  private interactionMeshes: Map<string, THREE.Line> = new Map()
  private labelObjects: Map<string, CSS2DObject> = new Map()

  // Groups for organization
  private proteinGroup: THREE.Group = new THREE.Group()
  private variantGroup: THREE.Group = new THREE.Group()
  private interactionGroup: THREE.Group = new THREE.Group()
  private labelGroup: THREE.Group = new THREE.Group()

  // Settings
  private settings: VisualizationSettings
  private isInitialized = false

  constructor(container: HTMLElement, settings: VisualizationSettings) {
    this.container = container
    this.settings = settings
    this.initializeEngine()
  }

  private initializeEngine(): void {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1a1a1a)

    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000)
    this.camera.position.set(0, 0, 50)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.container.appendChild(this.renderer.domElement)

    // Label renderer
    this.labelRenderer = new CSS2DRenderer()
    this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.labelRenderer.domElement.style.position = "absolute"
    this.labelRenderer.domElement.style.top = "0px"
    this.labelRenderer.domElement.style.pointerEvents = "none"
    this.container.appendChild(this.labelRenderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.maxDistance = 200
    this.controls.minDistance = 5

    // Lighting
    this.setupLighting()

    // Add groups to scene
    this.scene.add(this.proteinGroup)
    this.scene.add(this.variantGroup)
    this.scene.add(this.interactionGroup)
    this.scene.add(this.labelGroup)

    // Event listeners
    this.setupEventListeners()

    this.isInitialized = true
    this.startRenderLoop()
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
    this.scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
    keyLight.position.set(10, 10, 10)
    this.scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.6)
    fillLight.position.set(-10, 5, -10)
    this.scene.add(fillLight)
  }

  private setupEventListeners(): void {
    window.addEventListener("resize", this.onWindowResize.bind(this))
  }

  public loadProteinStructure(protein: ProteinStructure): void {
    this.clearVisualization()
    this.currentProtein = protein

    this.createProteinVisualization(protein)
    this.createVariantVisualization(protein.variants)
    this.createInteractionVisualization(protein.interactions)

    if (this.settings.showLabels) {
      this.createLabels()
    }

    this.fitCameraToStructure()
  }

  private createProteinVisualization(protein: ProteinStructure): void {
    if (!protein.structure) return

    // Create simple protein backbone
    this.createProteinBackbone()

    // Create domain representations
    protein.domains.forEach(domain => {
      this.createDomainMesh(domain)
    })

    this.updateVisualization()
  }

  private createProteinBackbone(): void {
    // Create a simple helix to represent the protein backbone
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-20, 0, 0),
      new THREE.Vector3(-10, 5, 0),
      new THREE.Vector3(0, 0, 5),
      new THREE.Vector3(10, -5, 0),
      new THREE.Vector3(20, 0, 0)
    ])

    const geometry = new THREE.TubeGeometry(curve, 100, 1, 8, false)
    const material = new THREE.MeshPhongMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.8
    })

    const mesh = new THREE.Mesh(geometry, material)
    this.proteinGroup.add(mesh)
  }

  private createDomainMesh(domain: ProteinDomain): void {
    let geometry: THREE.BufferGeometry
    const color = domain.color ? parseInt(domain.color.replace('#', '0x')) : 0x888888

    switch (domain.type) {
      case 'binding':
        geometry = new THREE.BoxGeometry(6, 6, 6)
        break
      case 'catalytic':
        geometry = new THREE.CylinderGeometry(3, 3, 8, 8)
        break
      default:
        geometry = new THREE.SphereGeometry(4, 16, 12)
    }

    const material = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.7
    })

    const mesh = new THREE.Mesh(geometry, material)

    // Position domains along the protein
    const position = (domain.startPosition / 1000) * 40 - 20
    mesh.position.set(position, Math.random() * 10 - 5, Math.random() * 10 - 5)

    mesh.userData = { domain, type: 'domain' }
    this.proteinGroup.add(mesh)
  }

  private createVariantVisualization(variants: ProteinVariant[]): void {
    variants.forEach(variant => {
      if (!this.shouldShowVariant(variant)) return

      const mesh = this.createVariantMesh(variant)
      this.variantMeshes.set(variant.id, mesh)
      this.variantGroup.add(mesh)
    })
  }

  private createVariantMesh(variant: ProteinVariant): THREE.Mesh {
    const impactColors = {
      high: 0xff4444,
      moderate: 0xffaa44,
      low: 0x44aaff,
      benign: 0x44ff44
    }

    const size = variant.impact === 'high' ? 2.0 : variant.impact === 'moderate' ? 1.5 : 1.0
    const color = impactColors[variant.impact]

    let geometry: THREE.BufferGeometry

    switch (variant.impact) {
      case 'high':
        geometry = new THREE.OctahedronGeometry(size)
        break
      case 'moderate':
        geometry = new THREE.ConeGeometry(size, size * 2, 6)
        break
      case 'low':
        geometry = new THREE.BoxGeometry(size, size, size)
        break
      default:
        geometry = new THREE.SphereGeometry(size, 8, 6)
    }

    const material = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      emissive: color,
      emissiveIntensity: 0.2
    })

    const mesh = new THREE.Mesh(geometry, material)

    if (variant.coordinates) {
      mesh.position.copy(variant.coordinates)
    } else {
      // Position based on variant position
      const position = (variant.position / 1000) * 40 - 20
      mesh.position.set(position, Math.random() * 10 - 5, Math.random() * 10 - 5)
    }

    mesh.userData = { variant, type: 'variant' }

    return mesh
  }

  private createInteractionVisualization(interactions: MolecularInteraction[]): void {
    interactions.forEach(interaction => {
      if (!interaction.visible) return

      const line = this.createInteractionLine(interaction)
      this.interactionMeshes.set(interaction.id, line)
      this.interactionGroup.add(line)
    })
  }

  private createInteractionLine(interaction: MolecularInteraction): THREE.Line {
    const interactionColors = {
      hydrogen_bond: 0x00aaff,
      salt_bridge: 0xff6600,
      hydrophobic: 0xffff00,
      van_der_waals: 0x888888,
      pi_stacking: 0xff00ff
    }

    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array([
      interaction.atom1.position.x, interaction.atom1.position.y, interaction.atom1.position.z,
      interaction.atom2.position.x, interaction.atom2.position.y, interaction.atom2.position.z
    ])

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.LineBasicMaterial({
      color: interactionColors[interaction.type],
      transparent: true,
      opacity: 0.7
    })

    const line = new THREE.Line(geometry, material)
    line.userData = { interaction, type: 'interaction' }

    return line
  }

  private createLabels(): void {
    if (!this.currentProtein) return

    this.currentProtein.variants.forEach(variant => {
      if (!this.shouldShowVariant(variant)) return

      const labelDiv = document.createElement('div')
      labelDiv.className = 'variant-label'
      labelDiv.style.color = 'white'
      labelDiv.style.fontSize = '12px'
      labelDiv.style.backgroundColor = 'rgba(0,0,0,0.5)'
      labelDiv.style.padding = '2px 4px'
      labelDiv.style.borderRadius = '3px'
      labelDiv.textContent = variant.hgvs

      const label = new CSS2DObject(labelDiv)
      const mesh = this.variantMeshes.get(variant.id)
      if (mesh) {
        label.position.copy(mesh.position)
        label.position.y += 3
      }

      this.labelObjects.set(variant.id, label)
      this.labelGroup.add(label)
    })
  }

  public updateSettings(newSettings: Partial<VisualizationSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.updateVisualization()
  }

  private updateVisualization(): void {
    this.updateTransparency()
    this.updateVisibility()
  }

  private updateTransparency(): void {
    const opacity = 1 - this.settings.transparency / 100

    this.proteinGroup.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshPhongMaterial).opacity = opacity
      }
    })

    this.variantMeshes.forEach(mesh => {
      (mesh.material as THREE.MeshPhongMaterial).opacity = opacity * 0.8
    })
  }

  private updateVisibility(): void {
    this.variantGroup.visible = this.settings.showVariants
    this.interactionGroup.visible = this.settings.showHydrogenBonds
    this.labelGroup.visible = this.settings.showLabels

    // Filter variants by impact
    this.variantMeshes.forEach((mesh, variantId) => {
      const variant = mesh.userData.variant as ProteinVariant
      mesh.visible = this.settings.variantImpactFilter.includes(variant.impact)
    })
  }

  private shouldShowVariant(variant: ProteinVariant): boolean {
    return this.settings.variantImpactFilter.includes(variant.impact)
  }

  public selectVariant(variantId: string): void {
    const mesh = this.variantMeshes.get(variantId)
    if (!mesh) return

    const material = mesh.material as THREE.MeshPhongMaterial

    if (mesh.userData.selected) {
      mesh.userData.selected = false
      material.emissiveIntensity = 0.2
    } else {
      mesh.userData.selected = true
      material.emissiveIntensity = 0.5
    }
  }

  private fitCameraToStructure(): void {
    if (!this.currentProtein) return

    const box = new THREE.Box3()

    this.proteinGroup.children.forEach(child => {
      box.expandByObject(child)
    })

    this.variantMeshes.forEach(mesh => {
      box.expandByObject(mesh)
    })

    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = this.camera.fov * (Math.PI / 180)
    const distance = Math.abs(maxDim / Math.sin(fov / 2)) * 1.5

    this.camera.position.copy(center)
    this.camera.position.z += distance

    this.controls.target.copy(center)
    this.controls.update()
  }

  private onWindowResize(): void {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight)
  }

  private clearVisualization(): void {
    this.proteinGroup.clear()
    this.variantGroup.clear()
    this.interactionGroup.clear()
    this.labelGroup.clear()

    this.atomMeshes.clear()
    this.variantMeshes.clear()
    this.interactionMeshes.clear()
    this.labelObjects.clear()
  }

  private startRenderLoop(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate)

      this.controls.update()

      if (this.settings.enableAnimation) {
        this.proteinGroup.rotation.y += this.settings.rotationSpeed * 0.01
      }

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
    this.controls.dispose()
    this.renderer.dispose()
    this.labelRenderer.domElement.remove()
    this.container.removeChild(this.renderer.domElement)
  }

  public exportStructure(format: 'pdb' | 'png' | 'obj'): string | Blob {
    switch (format) {
      case 'png':
        this.renderer.render(this.scene, this.camera)
        return this.renderer.domElement.toBlob ? new Blob() : ''
      case 'pdb':
        return this.generatePDBString()
      case 'obj':
        return this.generateOBJString()
      default:
        return ''
    }
  }

  private generatePDBString(): string {
    if (!this.currentProtein?.structure) return ''

    let pdbString = 'HEADER    GENOMICTWIN1 STRUCTURE\n'
    pdbString += 'END\n'
    return pdbString
  }

  private generateOBJString(): string {
    return '# GenomicTwin1 3D Structure Export\n'
  }

  public getSelectedVariants(): ProteinVariant[] {
    if (!this.currentProtein) return []

    return this.currentProtein.variants.filter(variant => {
      const mesh = this.variantMeshes.get(variant.id)
      return mesh?.userData.selected
    })
  }

  public resetView(): void {
    this.fitCameraToStructure()

    // Reset all variant selections
    this.variantMeshes.forEach(mesh => {
      mesh.userData.selected = false
      ;(mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.2
    })

    this.updateVisualization()
  }
}