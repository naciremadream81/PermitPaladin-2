import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertPermitPackageSchema } from "@shared/schema";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { z } from "zod";

const createPackageSchema = insertPermitPackageSchema.extend({
  constructionValue: z.string().optional(),
});

type CreatePackageForm = z.infer<typeof createPackageSchema>;

export default function CreatePackage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

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

  const form = useForm<CreatePackageForm>({
    resolver: zodResolver(createPackageSchema),
    defaultValues: {
      name: "",
      description: "",
      projectAddress: "",
      projectType: undefined,
      countyId: "",
      constructionValue: "",
    },
  });

  const { data: counties } = useQuery({
    queryKey: ["/api/counties"],
    retry: false,
  });

  const createPackageMutation = useMutation({
    mutationFn: async (data: CreatePackageForm) => {
      const submitData = {
        ...data,
        constructionValue: data.constructionValue 
          ? Math.round(parseFloat(data.constructionValue) * 100)
          : undefined,
      };
      delete (submitData as any).constructionValue;
      if (data.constructionValue) {
        (submitData as any).constructionValue = Math.round(parseFloat(data.constructionValue) * 100);
      }
      
      return await apiRequest("POST", "/api/packages", submitData);
    },
    onSuccess: async (response) => {
      const newPackage = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Success",
        description: "Permit package created successfully.",
      });
      
      setLocation(`/packages/${newPackage.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      
      toast({
        title: "Error",
        description: "Failed to create permit package. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreatePackageForm) => {
    createPackageMutation.mutate(data);
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          
          <h1 className="text-2xl font-bold text-gray-900">Create New Permit Package</h1>
          <p className="text-gray-600">Set up a new building permit package for your Florida construction project.</p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Package Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="countyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>County</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select County" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(counties) && counties.map((county: any) => (
                              <SelectItem key={county.id} value={county.id}>
                                {county.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="projectAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter complete address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="residential_new">Residential - New Construction</SelectItem>
                            <SelectItem value="residential_renovation">Residential - Renovation</SelectItem>
                            <SelectItem value="commercial_new">Commercial - New Construction</SelectItem>
                            <SelectItem value="commercial_renovation">Commercial - Renovation</SelectItem>
                            <SelectItem value="industrial">Industrial</SelectItem>
                            <SelectItem value="multi_family">Multi-Family</SelectItem>
                            <SelectItem value="accessory_structure">Accessory Structure</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="constructionValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Construction Value (USD)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            step="0.01" 
                            min="0" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the project scope and details..."
                          rows={4}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation("/")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-blue-700"
                    disabled={createPackageMutation.isPending}
                  >
                    {createPackageMutation.isPending ? "Creating..." : "Create Package"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
