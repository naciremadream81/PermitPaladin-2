import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";
import { useLocation } from "wouter";
import { Eye, Edit, Home, Building, Warehouse } from "lucide-react";

interface PackageCardProps {
  package: {
    id: string;
    name: string;
    projectAddress: string;
    projectType: string;
    status: string;
    updatedAt: string;
    countyId: string;
  };
}

export default function PackageCard({ package: pkg }: PackageCardProps) {
  const [, setLocation] = useLocation();

  const getProjectIcon = (projectType: string) => {
    switch (projectType) {
      case 'residential_new':
      case 'residential_renovation':
        return <Home className="h-5 w-5 text-primary" />;
      case 'commercial_new':
      case 'commercial_renovation':
        return <Building className="h-5 w-5 text-accent" />;
      case 'industrial':
        return <Warehouse className="h-5 w-5 text-secondary" />;
      default:
        return <Building className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatProjectType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      if (diffInHours < 1) return "Just now";
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mr-4">
              {getProjectIcon(pkg.projectType)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-4 mb-2">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {pkg.name}
                </h3>
                <StatusBadge status={pkg.status} />
              </div>
              <p className="text-sm text-gray-600 truncate mb-1">
                {pkg.projectAddress}
              </p>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span>{formatProjectType(pkg.projectType)}</span>
                <span>•</span>
                <span>Updated {formatDate(pkg.updatedAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation(`/packages/${pkg.id}`)}
              className="text-primary hover:text-blue-700"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // TODO: Implement edit functionality
                console.log("Edit package:", pkg.id);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
