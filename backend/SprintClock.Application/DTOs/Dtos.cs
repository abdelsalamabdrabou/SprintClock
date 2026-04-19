using SprintClock.Domain.Entities;

namespace SprintClock.Application.DTOs;

public record SprintConfigDto(
    DateTime StartDateTime,
    double MaxDailyHours,
    string WorkFrom,   // "HH:mm"
    string WorkUntil   // "HH:mm"
);

public record TeamMemberDto(string Name, string Team);

public record UserStoryDto(
    string Title,
    List<AssigneeHours> Frontend,
    List<AssigneeHours> Backend,
    List<AssigneeHours> Test
);

public record CalculateRequest(
    SprintConfigDto Config,
    List<UserStoryDto> Stories
);

public record DeliveryResultDto(
    string StoryTitle,
    DateTime? FrontendDelivery,
    DateTime? BackendDelivery,
    DateTime? TestDelivery,
    DateTime FinalDelivery,
    string CriticalPathTeam,
    Dictionary<string, DateTime> FrontendMemberDeliveries,
    Dictionary<string, DateTime> BackendMemberDeliveries,
    Dictionary<string, DateTime> TestMemberDeliveries
);

public record UserWorkloadDto(
    string Name,
    string Team,
    double TotalHours,
    int StoryCount
);

public record CalculateResponse(
    List<DeliveryResultDto> Results,
    List<UserWorkloadDto> Workloads,
    DateTime FeatureDelivery,
    int TotalStories,
    double TotalFrontendHours,
    double TotalBackendHours,
    double TotalTestHours,
    Guid SprintId = default,
    SprintConfigDto? Config = null
);

public record SprintSummaryDto(
    Guid Id,
    DateTime CreatedAt,
    DateTime FeatureDelivery,
    int TotalStories
);

public record UserStorySprintDto(
    Guid SprintId,
    DateTime SprintCreatedAt,
    string StoryTitle,
    double Hours,
    DateTime? DeliveryDateTime = null
);

public record UserStatsDto(
    string Name,
    string Team,
    double TotalHours,
    int StoryCount,
    List<UserStorySprintDto> Stories
);
