export interface SprintConfigDto {
  startDateTime: string; // ISO string
  maxDailyHours: number;
  workFrom: string; // "HH:mm"
  workUntil: string; // "HH:mm"
}

export interface AssigneeHours {
  name: string;
  hours: number;
}

export interface UserStoryDto {
  title: string;
  frontend: AssigneeHours[];
  backend: AssigneeHours[];
  test: AssigneeHours[];
}

export interface CalculateRequest {
  config: SprintConfigDto;
  stories: UserStoryDto[];
}

export interface DeliveryResultDto {
  storyTitle: string;
  frontendDelivery: string | null;
  backendDelivery: string | null;
  testDelivery: string | null;
  finalDelivery: string;
  criticalPathTeam: string;
}

export interface UserWorkloadDto {
  name: string;
  team: string;
  totalHours: number;
  storyCount: number;
}

export interface CalculateResponse {
  results: DeliveryResultDto[];
  workloads: UserWorkloadDto[];
  featureDelivery: string;
  totalStories: number;
  totalFrontendHours: number;
  totalBackendHours: number;
  totalTestHours: number;
  sprintId: string;
  config?: SprintConfigDto;
}

export interface SprintSummary {
  id: string;
  createdAt: string;
  featureDelivery: string;
  totalStories: number;
}

export interface UserStorySprintItem {
  sprintId: string;
  sprintCreatedAt: string;
  storyTitle: string;
  hours: number;
  deliveryDateTime: string | null;
}

export interface UserStats {
  name: string;
  team: string;
  totalHours: number;
  storyCount: number;
  stories: UserStorySprintItem[];
}

export interface TeamMembers {
  frontend: string[];
  backend: string[];
  test: string[];
}

export interface StoryRow {
  id: string;
  title: string;
  frontend: AssigneeHours[];
  backend: AssigneeHours[];
  test: AssigneeHours[];
}
