import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import StatCard from "@/components/StatCard";
import PackageCard from "@/components/PackageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Plus, Filter, Search } from "lucide-react";
import type { PermitPackage, County } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    search: "",
    county: "",
    status: "",
  });

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

  const { data: stats, isLoading: statsLoading } = useQuery<{
    activePackages: number;
    approvedPackages: number;
    underReviewPackages: number;
    issuePackages: number;
  }>({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const { data: counties = [] } = useQuery<County[]>({
    queryKey: ["/api/counties"],
    retry: false,
  });

  const { data: packages = [], isLoading: packagesLoading, error: packagesError } = useQuery<PermitPackage[]>({
    queryKey: ["/api/packages", filters.county, filters.status, filters.search],
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (packagesError && isUnauthorizedError(packagesError as Error)) {
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
  }, [packagesError, toast]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-medium text-gray-900">Dashboard</h2>
              <p className="mt-1 text-sm text-gray-600">Manage your Florida building permit packages</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button 
                className="bg-primary hover:bg-blue-700 text-white"
                onClick={() => setLocation("/packages/new")}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Permit Package
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Packages"
            value={stats?.activePackages || 0}
            icon="folder-open"
            color="primary"
            loading={statsLoading}
          />
          <StatCard
            title="Approved"
            value={stats?.approvedPackages || 0}
            icon="check-circle"
            color="secondary"
            loading={statsLoading}
          />
          <StatCard
            title="Under Review"
            value={stats?.underReviewPackages || 0}
            icon="clock"
            color="accent"
            loading={statsLoading}
          />
          <StatCard
            title="Issues"
            value={stats?.issuePackages || 0}
            icon="exclamation-triangle"
            color="error"
            loading={statsLoading}
          />
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Packages
                </label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Search by project name, address..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Florida County
                </label>
                <Select value={filters.county} onValueChange={(value) => handleFilterChange("county", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Counties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Counties</SelectItem>
                    {counties?.map((county: any) => (
                      <SelectItem key={county.id} value={county.id}>
                        {county.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => setFilters({ search: "", county: "", status: "" })}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permit Packages List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Permit Packages</CardTitle>
            <CardDescription>Track and manage your building permit applications</CardDescription>
          </CardHeader>
          <CardContent>
            {packagesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading packages...</p>
              </div>
            ) : packages?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No permit packages found.</p>
                <Button onClick={() => setLocation("/packages/new")}>
                  Create your first package
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {packages?.map((pkg: any) => (
                  <PackageCard key={pkg.id} package={pkg} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
