import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZXMiOlsiQURNSU4iXSwiZW1haWwiOiJhZG1pbkBmYWxjb24uY29tIiwiaXNzIjoiRmFsY29uQm9va2luZ1N5c3RlbSIsImlhdCI6MTc3OTU3MzE0MSwiZXhwIjoxNzc5NTc2NzQxfQ.zQ2joArYPA5bEYPP1X4V48D_vdgPXApeFv_BpmvtwLM",
  },
});
