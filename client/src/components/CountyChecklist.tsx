import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";
import type { ChecklistItem, PackageChecklistProgress } from "@shared/schema";

interface CountyChecklistProps {
  packageId: string;
  countyId: string;
  projectType: string;
}

export default function CountyChecklist({ packageId, countyId, projectType }: CountyChecklistProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<{ [itemId: string]: string }>({});

  const { data: checklistItems = [], isLoading: itemsLoading } = useQuery<ChecklistItem[]>({
    queryKey: ["/api/counties", countyId, "checklist", projectType],
    retry: false,
  });

  const { data: progress = [] } = useQuery<PackageChecklistProgress[]>({
    queryKey: ["/api/packages", packageId, "checklist"],
    retry: false,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ itemId, isCompleted, notes }: { 
      itemId: string; 
      isCompleted: boolean; 
      notes?: string;
    }) => {
      return await apiRequest("PUT", `/api/packages/${packageId}/checklist/${itemId}`, {
        isCompleted,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/packages", packageId, "checklist"] 
      });
      toast({
        title: "Success",
        description: "Checklist item updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update checklist item.",
        variant: "destructive",
      });
    },
  });

  const handleCheckboxChange = (itemId: string, isCompleted: boolean) => {
    updateProgressMutation.mutate({
      itemId,
      isCompleted,
      notes: notes[itemId] || "",
    });
  };

  const handleNotesChange = (itemId: string, value: string) => {
    setNotes(prev => ({ ...prev, [itemId]: value }));
  };

  const handleSaveNotes = (itemId: string) => {
    const item = progress.find((p) => p.checklistItemId === itemId);
    updateProgressMutation.mutate({
      itemId,
      isCompleted: item?.isCompleted || false,
      notes: notes[itemId] || "",
    });
  };

  const getProgressForItem = (itemId: string) => {
    return progress.find((p) => p.checklistItemId === itemId);
  };

  const completedCount = progress.filter((p) => p.isCompleted).length;
  const totalCount = checklistItems.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (itemsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>County Requirements Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-5 h-5 mt-1" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!checklistItems || checklistItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>County Requirements Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Checklist Available
            </h3>
            <p className="text-gray-600">
              County-specific requirements for this project type are not yet available.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>County Requirements Checklist</CardTitle>
          <div className="text-sm text-gray-600">
            {completedCount} of {totalCount} completed ({completionPercentage}%)
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-secondary h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {checklistItems.map((item: any) => {
            const itemProgress = getProgressForItem(item.id);
            const isCompleted = itemProgress?.isCompleted || false;
            const currentNotes = notes[item.id] ?? (itemProgress?.notes || "");

            return (
              <div key={item.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-secondary" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={(checked) => 
                            handleCheckboxChange(item.id, checked as boolean)
                          }
                          disabled={updateProgressMutation.isPending}
                        />
                        <span className={`font-medium ${
                          isCompleted ? "text-secondary line-through" : "text-gray-900"
                        }`}>
                          {item.title}
                          {item.isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </span>
                      </label>
                      {item.documentType && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                          {item.documentType.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {item.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add notes or comments..."
                        value={currentNotes}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                      {currentNotes !== (itemProgress?.notes || "") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveNotes(item.id)}
                          disabled={updateProgressMutation.isPending}
                        >
                          Save Notes
                        </Button>
                      )}
                    </div>

                    {itemProgress?.completedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Completed on {new Date(itemProgress.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
