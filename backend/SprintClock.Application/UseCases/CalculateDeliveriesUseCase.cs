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
            r.CriticalPathTeam,
            new Dictionary<string, DateTime>(r.FrontendMemberDeliveries),
            new Dictionary<string, DateTime>(r.BackendMemberDeliveries),
            new Dictionary<string, DateTime>(r.TestMemberDeliveries)
        )).ToList();

        var workloads = ComputeWorkloads(request.Stories);
        var featureDelivery = results.Count > 0
            ? results.Max(r => r.FinalDelivery)
            : request.Config.StartDateTime;

        return new CalculateResponse(
            resultDtos,
            workloads,
            featureDelivery,
            stories.Count,
            request.Stories.Sum(s => s.Frontend.Sum(a => a.Hours)),
            request.Stories.Sum(s => s.Backend.Sum(a => a.Hours)),
            request.Stories.Sum(s => s.Test.Sum(a => a.Hours))
        );
    }

    private static SprintConfig MapConfig(SprintConfigDto dto)
    {
        var workFrom = TimeOnly.Parse(dto.WorkFrom);
        var workUntil = TimeOnly.Parse(dto.WorkUntil);
        return new SprintConfig(dto.StartDateTime, dto.MaxDailyHours, workFrom, workUntil);
    }

    private static UserStory MapStory(UserStoryDto dto) =>
        new(dto.Title, dto.Frontend, dto.Backend, dto.Test);

    private static List<UserWorkloadDto> ComputeWorkloads(List<UserStoryDto> stories)
    {
        var workloads = new Dictionary<(string Name, string Team), (double Hours, int Count)>();

        foreach (var story in stories)
        {
            foreach (var a in story.Frontend)
                Accumulate(workloads, a.Name, "Frontend", a.Hours);
            foreach (var a in story.Backend)
                Accumulate(workloads, a.Name, "Backend", a.Hours);
            foreach (var a in story.Test)
                Accumulate(workloads, a.Name, "Test", a.Hours);
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
