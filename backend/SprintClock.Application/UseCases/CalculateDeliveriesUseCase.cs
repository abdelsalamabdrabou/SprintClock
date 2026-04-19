using SprintClock.Application.DTOs;
using SprintClock.Application.Interfaces;
using SprintClock.Domain.Entities;

namespace SprintClock.Application.UseCases;

public class CalculateDeliveriesUseCase
{
    private readonly IDeliveryCalculator _calculator;

    public CalculateDeliveriesUseCase(IDeliveryCalculator calculator)
    {
        _calculator = calculator;
    }

    public CalculateResponse Execute(CalculateRequest request)
    {
        var config = MapConfig(request.Config);
        var stories = request.Stories.Select(MapStory).ToList();

        var results = _calculator.Calculate(config, stories);

        var resultDtos = results.Select(r => new DeliveryResultDto(
            r.StoryTitle,
            r.FrontendDelivery,
            r.BackendDelivery,
            r.TestDelivery,
            r.FinalDelivery,
            r.CriticalPathTeam
        )).ToList();

        var workloads = ComputeWorkloads(request.Stories);
        var featureDelivery = results.Max(r => r.FinalDelivery);

        return new CalculateResponse(
            resultDtos,
            workloads,
            featureDelivery,
            stories.Count,
            request.Stories.Sum(s => s.FrontendHours),
            request.Stories.Sum(s => s.BackendHours),
            request.Stories.Sum(s => s.TestHours)
        );
    }

    private static SprintConfig MapConfig(SprintConfigDto dto)
    {
        var workFrom = TimeOnly.Parse(dto.WorkFrom);
        var workUntil = TimeOnly.Parse(dto.WorkUntil);
        return new SprintConfig(dto.StartDateTime, dto.MaxDailyHours, workFrom, workUntil);
    }

    private static UserStory MapStory(UserStoryDto dto) =>
        new(dto.Title, dto.FrontendAssignee, dto.BackendAssignee, dto.TestAssignee,
            dto.FrontendHours, dto.BackendHours, dto.TestHours);

    private static List<UserWorkloadDto> ComputeWorkloads(List<UserStoryDto> stories)
    {
        var workloads = new Dictionary<(string Name, string Team), (double Hours, int Count)>();

        foreach (var story in stories)
        {
            Accumulate(workloads, story.FrontendAssignee, "Frontend", story.FrontendHours);
            Accumulate(workloads, story.BackendAssignee, "Backend", story.BackendHours);
            Accumulate(workloads, story.TestAssignee, "Test", story.TestHours);
        }

        return workloads
            .Select(kv => new UserWorkloadDto(kv.Key.Name, kv.Key.Team, kv.Value.Hours, kv.Value.Count))
            .OrderBy(w => w.Team).ThenByDescending(w => w.TotalHours)
            .ToList();
    }

    private static void Accumulate(
        Dictionary<(string, string), (double, int)> dict,
        string name, string team, double hours)
    {
        if (string.IsNullOrWhiteSpace(name) || hours <= 0) return;
        var key = (name, team);
        var (h, c) = dict.GetValueOrDefault(key, (0, 0));
        dict[key] = (h + hours, c + 1);
    }
}
