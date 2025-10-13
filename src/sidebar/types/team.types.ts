export interface Project {
  id: number;
  name: string;
}

export interface Team {
  id: number;
  name: string;
  projects: Project[];
}
