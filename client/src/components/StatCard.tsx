import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderOpen, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: "primary" | "secondary" | "accent" | "error";
  loading?: boolean;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
}

export default function StatCard({ title, value, icon, color, loading, trend }: StatCardProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "folder-open":
        return FolderOpen;
      case "check-circle":
        return CheckCircle;
      case "clock":
        return Clock;
      case "exclamation-triangle":
        return AlertTriangle;
      default:
        return FolderOpen;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary bg-opacity-10 text-primary";
      case "secondary":
        return "bg-secondary bg-opacity-10 text-secondary";
      case "accent":
        return "bg-accent bg-opacity-10 text-accent";
      case "error":
        return "bg-error bg-opacity-10 text-error";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const Icon = getIcon(icon);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <div className="ml-4 flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorClasses(color)}`}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
              {trend && (
                <div className={`flex items-center text-xs ${
                  trend.direction === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  <TrendingUp className={`h-3 w-3 mr-1 ${
                    trend.direction === "down" ? "rotate-180" : ""
                  }`} />
                  {trend.value}%
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
