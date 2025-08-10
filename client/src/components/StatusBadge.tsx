import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  HourglassIcon, 
  XCircle, 
  AlertTriangle,
  FileCheck
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "draft":
        return {
          label: "Draft",
          icon: HourglassIcon,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        };
      case "pending":
        return {
          label: "Pending",
          icon: Clock,
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        };
      case "under_review":
        return {
          label: "Under Review",
          icon: Clock,
          className: "bg-accent bg-opacity-10 text-accent hover:bg-accent hover:bg-opacity-20",
        };
      case "approved":
        return {
          label: "Approved",
          icon: CheckCircle,
          className: "bg-secondary bg-opacity-10 text-secondary hover:bg-secondary hover:bg-opacity-20",
        };
      case "rejected":
        return {
          label: "Rejected",
          icon: XCircle,
          className: "bg-error bg-opacity-10 text-error hover:bg-error hover:bg-opacity-20",
        };
      case "issued":
        return {
          label: "Issued",
          icon: FileCheck,
          className: "bg-green-100 text-green-800 hover:bg-green-200",
        };
      case "expired":
        return {
          label: "Expired",
          icon: AlertTriangle,
          className: "bg-red-100 text-red-800 hover:bg-red-200",
        };
      default:
        return {
          label: "Unknown",
          icon: AlertTriangle,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  const iconSize = size === "lg" ? "h-4 w-4" : size === "md" ? "h-3 w-3" : "h-3 w-3";
  const textSize = size === "lg" ? "text-sm" : "text-xs";

  return (
    <Badge 
      variant="secondary" 
      className={`inline-flex items-center font-semibold ${config.className} ${textSize}`}
    >
      <Icon className={`mr-1 ${iconSize}`} />
      {config.label}
    </Badge>
  );
}
