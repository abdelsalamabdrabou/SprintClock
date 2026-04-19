export interface SprintConfigDto {
  startDateTime: string; // ISO string
  maxDailyHours: number;
  workFrom: string; // "HH:mm"
  workUntil: string; // "HH:mm"
}

export interface UserStoryDto {
  title: string;
  frontendAssignee: string;
  backendAssignee: string;
  testAssignee: string;
  frontendHours: number;
  backendHours: number;
  testHours: number;
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
}

export interface TeamMembers {
  frontend: string[];
  backend: string[];
  test: string[];
}

export interface StoryRow {
  id: string;
  title: string;
  frontendAssignee: string;
  backendAssignee: string;
  testAssignee: string;
  frontendHours: number;
  backendHours: number;
  testHours: number;
}
