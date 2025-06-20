"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Upload, FileText, FolderOpen, Download, Trash2,
  CheckCircle, XCircle, AlertCircle, Clock, RefreshCw,
  Database, Shield, Zap, HardDrive, Cloud, Archive,
  FileCode, FileSpreadsheet, Package, MoreVertical
} from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "processing" | "completed" | "failed"
  progress: number
  uploadDate: string
  patientId?: string
  validation?: {
    status: "valid" | "warning" | "error"
    message: string
  }
}

interface DataSource {
  id: string
  name: string
  type: "epic" | "local" | "cloud" | "api"
  status: "connected" | "disconnected" | "error"
  lastSync: string
  recordCount: number
}

export default function GenomicsUploadPage() {
  const [activeTab, setActiveTab] = useState("upload")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadedFiles: UploadedFile[] = [
    {
      id: "1",
      name: "patient_001_wgs.vcf",
      size: 1234567890,
      type: "VCF",
      status: "completed",
      progress: 100,
      uploadDate: "2024-01-15 14:30",
      patientId: "P001",
      validation: { status: "valid", message: "All checks passed" }
    },
    {
      id: "2",
      name: "tumor_sample_002.bam",
      size: 5432109876,
      type: "BAM",
      status: "processing",
      progress: 67,
      uploadDate: "2024-01-15 15:45",
      patientId: "P002",
      validation: { status: "warning", message: "Low coverage in some regions" }
    },
    {
      id: "3",
      name: "panel_003.fastq.gz",
      size: 987654321,
      type: "FASTQ",
      status: "uploading",
      progress: 45,
      uploadDate: "2024-01-15 16:20",
      validation: { status: "error", message: "Invalid format detected" }
    }
  ]

  const dataSources: DataSource[] = [
    {
      id: "1",
      name: "Epic MyChart",
      type: "epic",
      status: "connected",
      lastSync: "5 minutes ago",
      recordCount: 12456
    },
    {
      id: "2",
      name: "Local Storage",
      type: "local",
      status: "connected",
      lastSync: "Real-time",
      recordCount: 8923
    },
    {
      id: "3",
      name: "AWS S3 Bucket",
      type: "cloud",
      status: "disconnected",
      lastSync: "2 hours ago",
      recordCount: 45678
    }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    setSelectedFiles(files)
  }

  const startUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Genomic Data Upload</h1>
        <p className="text-gray-600">
          Upload, manage, and integrate genomic data from multiple sources
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Genomic Files</CardTitle>
                <CardDescription>
                  Support for VCF, BAM, FASTQ, and other genomic formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Drop files here or click to browse</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Support for VCF, BAM, FASTQ, BED, GFF, and compressed formats
                  </p>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                    accept=".vcf,.bam,.fastq,.bed,.gff,.gz,.zip"
                  />
                  <Label htmlFor="file-input">
                    <Button variant="outline" asChild>
                      <span>
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Browse Files
                      </span>
                    </Button>
                  </Label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Selected Files</h4>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 space-y-4">
                      <div>
                        <Label>Patient ID (Optional)</Label>
                        <Input placeholder="Enter patient identifier" />
                      </div>
                      <div>
                        <Label>Data Type</Label>
                        <Select defaultValue="auto">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto-detect</SelectItem>
                            <SelectItem value="germline">Germline</SelectItem>
                            <SelectItem value="somatic">Somatic</SelectItem>
                            <SelectItem value="rna">RNA-seq</SelectItem>
                            <SelectItem value="methylation">Methylation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        className="w-full"
                        onClick={startUpload}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Uploading... {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Start Upload
                          </>
                        )}
                      </Button>
                      {isUploading && (
                        <Progress value={uploadProgress} className="w-full" />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions & Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    Bulk Import from CSV
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Cloud className="h-4 w-4 mr-2" />
                    Import from Cloud Storage
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Connect to Database
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Storage Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Storage Used</span>
                        <span className="text-sm text-gray-500">2.4 TB / 5 TB</span>
                      </div>
                      <Progress value={48} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <HardDrive className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                        <p className="text-2xl font-semibold">1,234</p>
                        <p className="text-xs text-gray-500">Total Files</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <Zap className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                        <p className="text-2xl font-semibold">89%</p>
                        <p className="text-xs text-gray-500">Processing Speed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Validation Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox defaultChecked />
                      <label className="text-sm">Validate file format</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox defaultChecked />
                      <label className="text-sm">Check for duplicates</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox defaultChecked />
                      <label className="text-sm">Verify checksums</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox />
                      <label className="text-sm">Run quality control</label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Uploaded Files</CardTitle>
                  <CardDescription>
                    Manage your genomic data files
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Selected
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export List
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Validation</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadedFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <FileCode className="h-4 w-4 text-gray-500" />
                          <span>{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{file.type}</Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {file.status === "uploading" && (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                              <span className="text-sm">{file.progress}%</span>
                            </>
                          )}
                          {file.status === "processing" && (
                            <>
                              <Clock className="h-3 w-3 text-yellow-500" />
                              <span className="text-sm">{file.progress}%</span>
                            </>
                          )}
                          {file.status === "completed" && (
                            <>
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-sm">Ready</span>
                            </>
                          )}
                          {file.status === "failed" && (
                            <>
                              <XCircle className="h-3 w-3 text-red-500" />
                              <span className="text-sm">Failed</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{file.patientId || "-"}</TableCell>
                      <TableCell>{file.uploadDate}</TableCell>
                      <TableCell>
                        {file.validation && (
                          <Badge
                            variant={
                              file.validation.status === "valid" ? "secondary" :
                              file.validation.status === "warning" ? "outline" :
                              "destructive"
                            }
                          >
                            {file.validation.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataSources.map((source) => (
              <Card key={source.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <Badge
                      variant={
                        source.status === "connected" ? "secondary" :
                        source.status === "error" ? "destructive" :
                        "outline"
                      }
                    >
                      {source.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium capitalize">{source.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Last Sync</span>
                      <span className="font-medium">{source.lastSync}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Records</span>
                      <span className="font-medium">{source.recordCount.toLocaleString()}</span>
                    </div>
                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center h-full min-h-[200px]">
                <Button variant="ghost" className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Database className="h-6 w-6 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium">Add Data Source</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Settings</CardTitle>
              <CardDescription>
                Configure file processing and validation rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">File Processing</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Auto-process uploaded files</Label>
                      <Checkbox defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Compress large files</Label>
                      <Checkbox defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Generate checksums</Label>
                      <Checkbox defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Security</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Encrypt files at rest</Label>
                      <Checkbox defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Enable audit logging</Label>
                      <Checkbox defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Default retention period</Label>
                  <Select defaultValue="1year">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3months">3 months</SelectItem>
                      <SelectItem value="6months">6 months</SelectItem>
                      <SelectItem value="1year">1 year</SelectItem>
                      <SelectItem value="2years">2 years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}