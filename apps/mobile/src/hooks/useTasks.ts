import { useState, useEffect, useCallback, useMemo } from 'react';
import { CrmTask, TaskStatus } from '../types/crm';
import { CrmService } from '../services/crmService';

export function useTasks(initialStatus?: string) {
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();
  const [filterType, setFilterType] = useState<'today' | 'upcoming' | 'overdue' | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(
    async (
      status?: string,
      priority?: string,
      ftype?: 'today' | 'upcoming' | 'overdue',
      isRefresh = false
    ) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await CrmService.getCrmTasks({
          status: status === 'ALL' ? undefined : status,
          priority: priority === 'ALL' ? undefined : priority,
          filterType: ftype,
        });
        setTasks(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load tasks');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTasks(selectedStatus, priorityFilter, filterType);
  }, [selectedStatus, priorityFilter, filterType, fetchTasks]);

  const toggleTaskCompleted = async (id: string, currentStatus?: TaskStatus) => {
    const task = tasks.find((t) => t._id === id);
    const existingStatus = currentStatus || task?.status || 'pending';
    const newStatus: TaskStatus = existingStatus === 'completed' ? 'pending' : 'completed';
    try {
      await CrmService.updateTaskStatus(id, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
      );
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update task status');
    }
  };

  const createTask = async (data: {
    title: string;
    description?: string;
    dueDate: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    try {
      const created = await CrmService.createTask(data);
      setTasks((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create task');
    }
  };

  const refresh = () => fetchTasks(selectedStatus, priorityFilter, filterType, true);

  const pendingCount = useMemo(
    () => tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length,
    [tasks]
  );

  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === 'completed').length,
    [tasks]
  );

  const overdueCount = useMemo(() => {
    const now = new Date();
    return tasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now
    ).length;
  }, [tasks]);

  return {
    tasks,
    selectedStatus,
    setSelectedStatus,
    setStatusFilter: setSelectedStatus,
    priorityFilter,
    setPriorityFilter,
    filterType,
    setFilterType,
    isLoading,
    loading: isLoading,
    isRefreshing,
    refreshing: isRefreshing,
    error,
    toggleTaskCompleted,
    toggleTaskStatus: (id: string) => toggleTaskCompleted(id),
    createTask,
    refresh,
    pendingCount,
    completedCount,
    overdueCount,
  };
}
