import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Download, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import type { PackageDocument } from "@shared/schema";

interface DocumentPreviewProps {
  document: PackageDocument;
  children?: React.ReactNode;
}

export default function DocumentPreview({ document, children }: DocumentPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const isPreviewable = (mimeType: string) => {
    return mimeType.startsWith('image/') || 
           mimeType === 'application/pdf' ||
           mimeType.startsWith('text/');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = document.objectPath;
    link.download = document.originalFileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const adjustZoom = (delta: number) => {
    setZoom(prev => Math.max(25, Math.min(400, prev + delta)));
  };

  const rotateDocument = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('dwg') || mimeType.includes('autocad')) return '📐';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📁';
  };

  const renderPreview = () => {
    if (!isPreviewable(document.mimeType)) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">{getFileTypeIcon(document.mimeType)}</div>
          <p className="text-lg font-medium">Preview not available</p>
          <p className="text-sm text-gray-400 mb-4">This file type cannot be previewed</p>
          <Button onClick={handleDownload} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download to View
          </Button>
        </div>
      );
    }

    if (document.mimeType.startsWith('image/')) {
      return (
        <div className="relative overflow-auto max-h-[70vh] bg-gray-50 rounded-lg">
          <img
            src={document.objectPath}
            alt={document.originalFileName}
            className="max-w-full h-auto mx-auto"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-in-out'
            }}
            onLoad={() => setIsLoading(false)}
            onLoadStart={() => setIsLoading(true)}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-96" />
            </div>
          )}
        </div>
      );
    }

    if (document.mimeType === 'application/pdf') {
      return (
        <div className="h-[70vh] bg-gray-50 rounded-lg">
          <iframe
            src={document.objectPath}
            className="w-full h-full rounded-lg"
            title={document.originalFileName}
          />
        </div>
      );
    }

    if (document.mimeType.startsWith('text/')) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 max-h-[70vh] overflow-auto">
          <iframe
            src={document.objectPath}
            className="w-full h-96 border-none"
            title={document.originalFileName}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <DialogTitle className="text-lg font-semibold truncate">
              {document.originalFileName}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{document.documentType}</Badge>
              <span className="text-sm text-gray-500">
                {formatFileSize(document.fileSize)}
              </span>
              <span className="text-sm text-gray-500">
                {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'Unknown date'}
              </span>
            </div>
          </div>
          
          {/* Preview Controls */}
          {isPreviewable(document.mimeType) && document.mimeType.startsWith('image/') && (
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustZoom(-25)}
                disabled={zoom <= 25}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustZoom(25)}
                disabled={zoom >= 400}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rotateDocument}
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}