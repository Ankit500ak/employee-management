import http from './http';

const TEAM_API = '/teams';

export const teamApi = {
    getTeams: () => http.get(`${TEAM_API}/`),
    createTeam: (teamData) => http.post(`${TEAM_API}/`, teamData),
    getTeam: (teamId) => http.get(`${TEAM_API}/${teamId}/`),
    updateTeam: (teamId, teamData) => http.put(`${TEAM_API}/${teamId}/`, teamData),
    deleteTeam: (teamId) => http.delete(`${TEAM_API}/${teamId}/`),
};
