export const projectCache = {
  get: (projectId: string) => {
    const cached = localStorage.getItem(`project-${projectId}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Caché válido por 5 minutos
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
    return null;
  },
  
  set: (projectId: string, data: any) => {
    localStorage.setItem(`project-${projectId}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }
}; 