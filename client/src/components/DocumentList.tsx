import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "./ObjectUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";
import { 
  FileText, 
  Download, 
  Trash2, 
  Plus, 
  Calendar,
  User,
  FolderOpen
} from "lucide-react";

interface DocumentListProps {
  packageId: string;
}

export default function DocumentList({ packageId }: DocumentListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/packages", packageId, "documents"],
    retry: false,
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: {
      documentURL: string;
      fileName: string;
      originalFileName: string;
      fileSize: number;
      mimeType: string;
      documentType: string;
    }) => {
      return await apiRequest("POST", `/api/packages/${packageId}/documents`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/packages", packageId, "documents"] 
      });
      toast({
        title: "Success",
        description: "Document uploaded successfully.",
      });
      setSelectedDocumentType(undefined);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload document.",
        variant: "destructive",
      });
    },
  });

  const getUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload", {});
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0 && selectedDocumentType) {
      const uploadedFile = result.successful[0];
      const file = uploadedFile.data as any;
      
      uploadDocumentMutation.mutate({
        documentURL: uploadedFile.uploadURL!,
        fileName: file.name,
        originalFileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        documentType: selectedDocumentType,
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDocumentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const documentTypes = [
    { value: "application_form", label: "Application Form" },
    { value: "site_plan", label: "Site Plan" },
    { value: "floor_plan", label: "Floor Plan" },
    { value: "structural_details", label: "Structural Details" },
    { value: "electrical_schematics", label: "Electrical Schematics" },
    { value: "mechanical_plans", label: "Mechanical Plans" },
    { value: "plumbing_plans", label: "Plumbing Plans" },
    { value: "special_inspections", label: "Special Inspections" },
    { value: "flood_certificate", label: "Flood Certificate" },
    { value: "environmental_permit", label: "Environmental Permit" },
    { value: "impact_fee_calculation", label: "Impact Fee Calculation" },
    { value: "property_survey", label: "Property Survey" },
    { value: "easement_agreement", label: "Easement Agreement" },
    { value: "product_approval", label: "Product Approval" },
    { value: "energy_compliance", label: "Energy Compliance" },
    { value: "fire_dept_approval", label: "Fire Department Approval" },
    { value: "other", label: "Other" },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="w-10 h-10" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="w-8 h-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Documents</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={10485760} // 10MB
              onGetUploadParameters={getUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName={selectedDocumentType ? "" : "opacity-50 cursor-not-allowed"}
            >
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Upload Document</span>
              </div>
            </ObjectUploader>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!documents || documents.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Documents Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Upload construction documents, plans, and forms for this permit package.
            </p>
            <div className="text-sm text-gray-500">
              Supported formats: PDF, DWG, JPG, PNG (Max 10MB each)
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {(documents as any[]).map((document: any) => (
              <div key={document.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {document.originalFileName}
                    </h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {formatDocumentType(document.documentType)}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(document.createdAt).toLocaleDateString()}
                    </span>
                    <span>{formatFileSize(document.fileSize)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.open(document.objectPath, '_blank');
                    }}
                    className="text-primary hover:text-blue-700"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // TODO: Implement delete functionality
                      console.log("Delete document:", document.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
