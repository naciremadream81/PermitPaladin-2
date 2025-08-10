import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import StatusBadge from "@/components/StatusBadge";
import DocumentList from "@/components/DocumentList";
import CountyChecklist from "@/components/CountyChecklist";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, FileText, CheckSquare } from "lucide-react";
import { useLocation } from "wouter";
import type { PermitPackage, County } from "@shared/schema";

export default function PackageDetail() {
  const params = useParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const packageId = params.id;

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: package_, isLoading: packageLoading, error: packageError } = useQuery<PermitPackage>({
    queryKey: ["/api/packages", packageId],
    retry: false,
    enabled: !!packageId,
  });

  const { data: county } = useQuery<County>({
    queryKey: ["/api/counties", package_?.countyId],
    retry: false,
    enabled: !!package_?.countyId,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (packageError && isUnauthorizedError(packageError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [packageError, toast]);

  if (isLoading || packageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (!package_) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Package not found.</p>
                <Button onClick={() => setLocation("/")}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{package_.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{package_.projectAddress}</span>
                {county && <span>•</span>}
                {county && <span>{county.name}</span>}
                <StatusBadge status={package_.status} />
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Package
              </Button>
            </div>
          </div>
        </div>

        {/* Package Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Package Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Project Type</h4>
                <p className="text-gray-900 capitalize">{package_.projectType?.replace('_', ' ')}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Construction Value</h4>
                <p className="text-gray-900">
                  {package_.constructionValue 
                    ? `$${(package_.constructionValue / 100).toLocaleString()}` 
                    : 'Not specified'
                  }
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Permit Number</h4>
                <p className="text-gray-900">{package_.permitNumber || 'Not assigned'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Created</h4>
                <p className="text-gray-900">
                  {new Date(package_.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {package_.description && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                <p className="text-gray-900">{package_.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Documents and Checklist */}
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center">
              <CheckSquare className="h-4 w-4 mr-2" />
              Checklist
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents" className="mt-6">
            <DocumentList packageId={package_.id} />
          </TabsContent>
          
          <TabsContent value="checklist" className="mt-6">
            <CountyChecklist 
              packageId={package_.id}
              countyId={package_.countyId}
              projectType={package_.projectType}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
