import http from './http';

const TASK_API = '/tasks';

export const taskApi = {
    getAllTasks: () => http.get(`${TASK_API}/`),
    getCreatedTasks: () => http.get(`${TASK_API}/created_by_me/`),
    getAssignedTasks: () => http.get(`${TASK_API}/assigned_to_me/`),
    getMyChildrenTasks: () => http.get(`${TASK_API}/my_children_tasks/`),
    getDashboardStats: () => http.get(`${TASK_API}/dashboard_stats/`),
    createTask: (taskData) => http.post(`${TASK_API}/`, taskData),
    updateTask: (taskId, taskData) => http.put(`${TASK_API}/${taskId}/`, taskData),
    partialUpdateTask: (taskId, taskData) => http.patch(`${TASK_API}/${taskId}/`, taskData),
    updateTaskStatus: (taskId, status) => http.patch(`${TASK_API}/${taskId}/update_status/`, { status }),
    reassignTask: (taskId, newAssigneeId) => http.post(`${TASK_API}/${taskId}/reassign/`, { assigned_to: newAssigneeId }),
    deleteTask: (taskId) => http.delete(`${TASK_API}/${taskId}/`),
    getTask: (taskId) => http.get(`${TASK_API}/${taskId}/`),
};
