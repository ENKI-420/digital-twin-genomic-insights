"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  MessageCircle,
  Download,
  FolderSyncIcon as Sync,
  Database,
  FileText,
  Activity,
  Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ResearchProject {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
  user_id: string
  status: string
  is_public: boolean
  cosmic_id?: string
  nih_reference_id?: string
}

interface Collaborator {
  id: string
  user_id: string
  role: string
  joined_at: string
}

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  parent_id?: string
}

interface ResearchFile {
  id: string
  file_name: string
  file_size: number
  content_type: string
  blob_url: string
  uploaded_at: string
  description?: string
}

interface SyncLog {
  id: string
  sync_time: string
  source: string
  records_synced: number
  status: string
  error_message?: string
}

export default function RealTimeCollaboration() {
  const [projects, setProjects] = useState<ResearchProject[]>([])
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [files, setFiles] = useState<ResearchFile[]>([])
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  const supabase = createClientSupabaseClient()

  // Load projects
  const loadProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from("genomic_research")
      .select("*")
      .order("updated_at", { ascending: false })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load research projects",
        variant: "destructive",
      })
      return
    }

    setProjects(data || [])
    if (data && data.length > 0 && !selectedProject) {
      setSelectedProject(data[0])
    }
  }, [supabase, toast, selectedProject])

  // Load project details
  const loadProjectDetails = useCallback(
    async (projectId: string) => {
      // Load collaborators
      const { data: collabData } = await supabase
        .from("research_collaborators")
        .select("*")
        .eq("research_id", projectId)

      setCollaborators(collabData || [])

      // Load comments
      const { data: commentData } = await supabase
        .from("research_comments")
        .select("*")
        .eq("research_id", projectId)
        .order("created_at", { ascending: true })

      setComments(commentData || [])

      // Load files
      const { data: fileData } = await supabase
        .from("research_files")
        .select("*")
        .eq("research_id", projectId)
        .order("uploaded_at", { ascending: false })

      setFiles(fileData || [])
    },
    [supabase],
  )

  // Load sync logs
  const loadSyncLogs = useCallback(async () => {
    try {
      const response = await fetch("/api/research/sync")
      const data = await response.json()
      setSyncLogs(data.recent_syncs || [])
    } catch (error) {
      console.error("Failed to load sync logs:", error)
    }
  }, [])

  // Sync with research hub
  const syncWithResearchHub = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/research/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [] }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Sync Complete",
          description: `Synced ${result.synced_records} research records`,
        })
        await loadProjects()
        await loadSyncLogs()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Add comment
  const addComment = async () => {
    if (!selectedProject || !newComment.trim()) return

    const { error } = await supabase.from("research_comments").insert({
      research_id: selectedProject.id,
      content: newComment,
      user_id: "00000000-0000-0000-0000-000000000000", // Mock user
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
      return
    }

    setNewComment("")
    await loadProjectDetails(selectedProject.id)
  }

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("genomic_research_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "genomic_research" }, () => {
        loadProjects()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "research_comments" }, () => {
        if (selectedProject) {
          loadProjectDetails(selectedProject.id)
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "research_files" }, () => {
        if (selectedProject) {
          loadProjectDetails(selectedProject.id)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, loadProjects, loadProjectDetails, selectedProject])

  // Initial load
  useEffect(() => {
    loadProjects()
    loadSyncLogs()
  }, [loadProjects, loadSyncLogs])

  // Load project details when selection changes
  useEffect(() => {
    if (selectedProject) {
      loadProjectDetails(selectedProject.id)
    }
  }, [selectedProject, loadProjectDetails])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Genomic Research Collaboration</h1>
          <p className="text-muted-foreground">Collaborate with researchers worldwide on genomic discoveries</p>
        </div>
        <Button onClick={syncWithResearchHub} disabled={isSyncing}>
          <Sync className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Research Hub"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Research Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedProject?.id === project.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="font-medium text-sm">{project.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{project.description?.substring(0, 60)}...</div>
                    <div className="flex items-center gap-2 mt-2">
                      {project.cosmic_id && (
                        <Badge variant="secondary" className="text-xs">
                          COSMIC
                        </Badge>
                      )}
                      {project.nih_reference_id && (
                        <Badge variant="outline" className="text-xs">
                          NIH
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {selectedProject?.title || "Select a Project"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProject ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="collaborators">
                    <Users className="h-4 w-4 mr-1" />
                    Team ({collaborators.length})
                  </TabsTrigger>
                  <TabsTrigger value="comments">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Comments ({comments.length})
                  </TabsTrigger>
                  <TabsTrigger value="files">
                    <FileText className="h-4 w-4 mr-1" />
                    Files ({files.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm">COSMIC ID</h4>
                      <p className="text-sm text-muted-foreground">{selectedProject.cosmic_id || "Not available"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">NIH Reference</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedProject.nih_reference_id || "Not available"}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="collaborators" className="space-y-4">
                  <div className="space-y-2">
                    {collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="flex items-center gap-3 p-2 rounded-lg border">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{collaborator.user_id.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">User {collaborator.user_id.substring(0, 8)}</div>
                          <div className="text-xs text-muted-foreground">{collaborator.role}</div>
                        </div>
                        <Badge variant="outline">{collaborator.role}</Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="space-y-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-3 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {comment.user_id.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">User {comment.user_id.substring(0, 8)}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={addComment} disabled={!newComment.trim()}>
                      Post
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="files" className="space-y-4">
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{file.file_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(file.file_size / 1024 / 1024).toFixed(2)} MB • {file.content_type}
                          </div>
                          {file.description && (
                            <div className="text-xs text-muted-foreground mt-1">{file.description}</div>
                          )}
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={file.blob_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center text-muted-foreground py-8">Select a research project to view details</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Sync Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {syncLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant={log.status === "success" ? "default" : "destructive"}>{log.status}</Badge>
                  <span className="text-sm">{log.source}</span>
                  <span className="text-sm text-muted-foreground">{log.records_synced} records</span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(log.sync_time).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
