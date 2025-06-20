"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  RotateCcw,
  Download,
  Play,
  Pause,
  Maximize2,
  Settings,
  Eye,
  EyeOff,
  Palette,
  Layers,
  Zap,
  Info,
  Search
} from 'lucide-react'
import { ProteinStructureEngine, VisualizationSettings, ProteinStructure, ProteinVariant } from '@/lib/genomics/protein-structure-engine'
import * as THREE from 'three'

interface ThreeDProteinViewerProps {
  gene: string
  proteinStructure?: ProteinStructure
  selectedVariants?: string[]
  onVariantSelect?: (variantId: string) => void
  onSettingsChange?: (settings: VisualizationSettings) => void
  className?: string
}

interface ViewerState {
  isLoading: boolean
  isFullscreen: boolean
  isAnimating: boolean
  selectedVariants: Set<string>
  hoveredVariant: string | null
  rotation: { x: number; y: number; z: number }
}

export function ThreeDProteinViewer({
  gene,
  proteinStructure,
  selectedVariants = [],
  onVariantSelect,
  onSettingsChange,
  className = ""
}: ThreeDProteinViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<ProteinStructureEngine | null>(null)

  const [viewerState, setViewerState] = useState<ViewerState>({
    isLoading: true,
    isFullscreen: false,
    isAnimating: false,
    selectedVariants: new Set(selectedVariants),
    hoveredVariant: null,
    rotation: { x: 0, y: 0, z: 0 }
  })

  const [settings, setSettings] = useState<VisualizationSettings>({
    colorScheme: 'cpk',
    representation: 'cartoon',
    transparency: 0,
    showLabels: true,
    showHydrogenBonds: false,
    showSideChains: false,
    showWaterMolecules: false,
    showVariants: true,
    variantImpactFilter: ['high', 'moderate', 'low', 'benign'],
    rotationSpeed: 1,
    enableAnimation: false
  })

  // Sample BRCA1 protein structure data
  const defaultProteinStructure: ProteinStructure = {
    id: 'brca1_structure',
    gene: 'BRCA1',
    name: 'BRCA1 Protein',
    pdbId: '1JNX',
    sequence: 'MDLSALRVEEALA...',
    domains: [
      {
        id: 'ring_domain',
        name: 'RING Domain',
        type: 'binding',
        startPosition: 1,
        endPosition: 109,
        description: 'E3 ubiquitin ligase activity',
        color: '#ff4444'
      },
      {
        id: 'brct_domain',
        name: 'BRCT Domain',
        type: 'binding',
        startPosition: 1650,
        endPosition: 1863,
        description: 'Protein-protein interaction',
        color: '#4444ff'
      }
    ],
    variants: [
      {
        id: 'var_1',
        position: 69,
        referenceAA: 'CG',
        alternateAA: '',
        impact: 'high',
        clinicalSignificance: 'pathogenic',
        consequence: 'frameshift',
        hgvs: 'c.68_69del',
        coordinates: new THREE.Vector3(-5, 10, 2)
      },
      {
        id: 'var_2',
        position: 185,
        referenceAA: 'A',
        alternateAA: 'G',
        impact: 'moderate',
        clinicalSignificance: 'likely_pathogenic',
        consequence: 'missense',
        hgvs: 'c.181T>C',
        coordinates: new THREE.Vector3(8, -3, 5)
      },
      {
        id: 'var_3',
        position: 1175,
        referenceAA: 'S',
        alternateAA: 'F',
        impact: 'low',
        clinicalSignificance: 'vus',
        consequence: 'missense',
        hgvs: 'c.1175C>T',
        coordinates: new THREE.Vector3(-2, 15, -8)
      }
    ],
    interactions: [
      {
        id: 'int_1',
        type: 'hydrogen_bond',
        atom1: { id: 'atom1', element: 'N', position: new THREE.Vector3(0, 0, 0), residue: 'ARG', residueNumber: 71, chain: 'A' },
        atom2: { id: 'atom2', element: 'O', position: new THREE.Vector3(2.8, 0, 0), residue: 'ASP', residueNumber: 96, chain: 'A' },
        distance: 2.8,
        visible: true
      }
    ],
    structure: {
      atoms: [
        { id: 'atom1', element: 'C', position: new THREE.Vector3(0, 0, 0), residue: 'ALA', residueNumber: 1, chain: 'A' },
        { id: 'atom2', element: 'N', position: new THREE.Vector3(1.5, 0, 0), residue: 'ALA', residueNumber: 1, chain: 'A' },
        { id: 'atom3', element: 'O', position: new THREE.Vector3(0, 1.2, 0), residue: 'ALA', residueNumber: 1, chain: 'A' }
      ],
      bonds: [
        { id: 'bond1', atom1Id: 'atom1', atom2Id: 'atom2', type: 'single', order: 1 }
      ],
      secondaryStructure: [
        { id: 'helix1', type: 'helix', startResidue: 1, endResidue: 20, chain: 'A' }
      ]
    }
  }

  const currentStructure = proteinStructure || defaultProteinStructure

  // Initialize the 3D engine
  useEffect(() => {
    if (!viewerRef.current) return

    const engine = new ProteinStructureEngine(viewerRef.current, settings)
    engineRef.current = engine

    // Load the protein structure
    engine.loadProteinStructure(currentStructure)

    setViewerState(prev => ({ ...prev, isLoading: false }))

    return () => {
      engine.dispose()
    }
  }, [])

  // Update settings when they change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateSettings(settings)
      onSettingsChange?.(settings)
    }
  }, [settings, onSettingsChange])

  const handleSettingChange = useCallback(<K extends keyof VisualizationSettings>(
    key: K,
    value: VisualizationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleVariantSelect = useCallback((variantId: string) => {
    if (engineRef.current) {
      engineRef.current.selectVariant(variantId)

      setViewerState(prev => {
        const newSelected = new Set(prev.selectedVariants)
        if (newSelected.has(variantId)) {
          newSelected.delete(variantId)
        } else {
          newSelected.add(variantId)
        }
        return { ...prev, selectedVariants: newSelected }
      })

      onVariantSelect?.(variantId)
    }
  }, [onVariantSelect])

  const handleResetView = () => {
    if (engineRef.current) {
      engineRef.current.resetView()
      setViewerState(prev => ({
        ...prev,
        selectedVariants: new Set(),
        rotation: { x: 0, y: 0, z: 0 }
      }))
    }
  }

  const handleToggleAnimation = () => {
    const newAnimating = !viewerState.isAnimating
    setViewerState(prev => ({ ...prev, isAnimating: newAnimating }))
    handleSettingChange('enableAnimation', newAnimating)
  }

  const handleExport = (format: 'png' | 'pdb' | 'obj') => {
    if (engineRef.current) {
      const data = engineRef.current.exportStructure(format)

      if (format === 'png' && data instanceof Blob) {
        const url = URL.createObjectURL(data)
        const a = document.createElement('a')
        a.href = url
        a.download = `${gene}_structure.png`
        a.click()
        URL.revokeObjectURL(url)
      } else if (typeof data === 'string') {
        const blob = new Blob([data], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${gene}_structure.${format}`
        a.click()
        URL.revokeObjectURL(url)
      }
    }
  }

  const getVariantsByImpact = (impact: string) => {
    return currentStructure.variants.filter(v => v.impact === impact)
  }

  const impactColors = {
    high: '#ff4444',
    moderate: '#ffaa44',
    low: '#44aaff',
    benign: '#44ff44'
  }

  const renderVariantList = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Active Variants</Label>
        <Badge variant="outline" className="text-xs">
          {viewerState.selectedVariants.size} selected
        </Badge>
      </div>

      <div className="space-y-2 max-h-32 overflow-y-auto">
        {currentStructure.variants.map(variant => (
          <div
            key={variant.id}
            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
              viewerState.selectedVariants.has(variant.id)
                ? 'bg-blue-100 border border-blue-300'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => handleVariantSelect(variant.id)}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: impactColors[variant.impact] }}
              />
              <div>
                <div className="font-mono text-xs">{variant.hgvs}</div>
                <div className="text-xs text-gray-500">{variant.consequence}</div>
              </div>
            </div>
            <Badge
              variant={variant.impact === 'high' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {variant.impact}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">3D Protein Structure</h2>
          <p className="text-gray-600">Gene: {gene}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleAnimation}
          >
            {viewerState.isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {viewerState.isAnimating ? 'Pause' : 'Play'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetView}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>

          <Select onValueChange={(value) => handleExport(value as 'png' | 'pdb' | 'obj')}>
            <SelectTrigger className="w-32">
              <Download className="h-4 w-4 mr-2" />
              Export
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG Image</SelectItem>
              <SelectItem value="pdb">PDB File</SelectItem>
              <SelectItem value="obj">3D Model</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main 3D Viewer */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <div className="relative">
              <div
                ref={viewerRef}
                className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden"
              />

              {viewerState.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                  <div className="text-white">Loading protein structure...</div>
                </div>
              )}

              {/* Rotation Display */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded text-sm">
                Rotation: {viewerState.rotation.x}°, {viewerState.rotation.y}°, {viewerState.rotation.z}°
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-black/80 text-white p-3 rounded">
                <div className="text-sm font-medium mb-2">Legend</div>
                <div className="space-y-1 text-xs">
                  {Object.entries(impactColors).map(([impact, color]) => (
                    <div key={impact} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="capitalize">{impact} Impact</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls Panel */}
        <div className="space-y-4">
          {/* Gene Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-4 w-4" />
                Gene Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={gene} onValueChange={() => {}}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gene" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRCA1">BRCA1</SelectItem>
                  <SelectItem value="BRCA2">BRCA2</SelectItem>
                  <SelectItem value="TP53">TP53</SelectItem>
                  <SelectItem value="EGFR">EGFR</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Display Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Display Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="appearance" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="appearance">Style</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>

                <TabsContent value="appearance" className="space-y-4">
                  <div>
                    <Label className="text-sm">Color Scheme</Label>
                    <Select
                      value={settings.colorScheme}
                      onValueChange={(value) => handleSettingChange('colorScheme', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpk">CPK Colors</SelectItem>
                        <SelectItem value="chain">By Chain</SelectItem>
                        <SelectItem value="secondary">Secondary Structure</SelectItem>
                        <SelectItem value="hydrophobicity">Hydrophobicity</SelectItem>
                        <SelectItem value="conservation">Conservation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Representation</Label>
                    <Select
                      value={settings.representation}
                      onValueChange={(value) => handleSettingChange('representation', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cartoon">Cartoon</SelectItem>
                        <SelectItem value="spacefill">Space Fill</SelectItem>
                        <SelectItem value="stick">Stick</SelectItem>
                        <SelectItem value="wireframe">Wireframe</SelectItem>
                        <SelectItem value="surface">Surface</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Transparency: {settings.transparency}%</Label>
                    <Slider
                      value={[settings.transparency]}
                      onValueChange={([value]) => handleSettingChange('transparency', value)}
                      min={0}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Labels</Label>
                      <Switch
                        checked={settings.showLabels}
                        onCheckedChange={(checked) => handleSettingChange('showLabels', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Show Hydrogen Bonds</Label>
                      <Switch
                        checked={settings.showHydrogenBonds}
                        onCheckedChange={(checked) => handleSettingChange('showHydrogenBonds', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Show Side Chains</Label>
                      <Switch
                        checked={settings.showSideChains}
                        onCheckedChange={(checked) => handleSettingChange('showSideChains', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Show Water Molecules</Label>
                      <Switch
                        checked={settings.showWaterMolecules}
                        onCheckedChange={(checked) => handleSettingChange('showWaterMolecules', checked)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Active Variants */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Active Variants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderVariantList()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}