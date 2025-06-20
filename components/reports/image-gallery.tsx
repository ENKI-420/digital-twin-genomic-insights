"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Maximize2 } from "lucide-react"

interface ImageGalleryProps {
  images: Array<{
    id: string
    description: string
    url: string
  }>
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<{
    id: string
    description: string
    url: string
  } | null>(null)

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative border rounded-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-12 relative">
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.description}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
              <Button variant="outline" size="sm" className="bg-white" onClick={() => setSelectedImage(image)}>
                <Maximize2 className="h-4 w-4 mr-2" />
                Enlarge
              </Button>
            </div>
            <div className="p-2 bg-white">
              <p className="text-sm font-medium">{image.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{selectedImage?.description}</DialogTitle>
          </DialogHeader>
          <div className="relative h-[70vh]">
            {selectedImage && (
              <Image
                src={selectedImage.url || "/placeholder.svg"}
                alt={selectedImage.description}
                fill
                className="object-contain"
                sizes="100vw"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
