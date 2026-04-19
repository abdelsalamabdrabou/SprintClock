using System.Text.Json;
using SprintClock.Application.DTOs;
using SprintClock.Application.Interfaces;

namespace SprintClock.Application.UseCases;

public class GetUserStatsUseCase
{
    private readonly ISprintRepository _repository;

    public GetUserStatsUseCase(ISprintRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<UserStatsDto>> ExecuteAsync(string name)
    {
        var snapshots = await _repository.GetAllAsync();

        var byTeam = new Dictionary<string, List<UserStorySprintDto>>();
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        foreach (var snapshot in snapshots)
        {
            var request = JsonSerializer.Deserialize<CalculateRequest>(snapshot.RequestJson, options);
            if (request?.Stories is null) continue;

            var response = JsonSerializer.Deserialize<CalculateResponse>(snapshot.ResponseJson, options);

            // Build a lookup: storyTitle -> DeliveryResult
            var deliveryMap = response?.Results?
                .ToDictionary(r => r.StoryTitle, r => r, StringComparer.OrdinalIgnoreCase)
                ?? new Dictionary<string, DeliveryResultDto>();

            foreach (var story in request.Stories)
            {
                deliveryMap.TryGetValue(story.Title, out var delivery);

                foreach (var a in story.Frontend ?? [])
                    Collect(byTeam, "Frontend", name, a.Name, a.Hours,
                        snapshot.Id, snapshot.CreatedAt, story.Title,
                        Lookup(delivery?.FrontendMemberDeliveries, a.Name));
                foreach (var a in story.Backend ?? [])
                    Collect(byTeam, "Backend", name, a.Name, a.Hours,
                        snapshot.Id, snapshot.CreatedAt, story.Title,
                        Lookup(delivery?.BackendMemberDeliveries, a.Name));
                foreach (var a in story.Test ?? [])
                    Collect(byTeam, "Test", name, a.Name, a.Hours,
                        snapshot.Id, snapshot.CreatedAt, story.Title,
                        Lookup(delivery?.TestMemberDeliveries, a.Name));
            }
        }

        return byTeam
            .Select(kv => new UserStatsDto(
                name,
                kv.Key,
                kv.Value.Sum(s => s.Hours),
                kv.Value.Count,
                kv.Value
            ))
            .ToList();
    }

    private static DateTime? Lookup(Dictionary<string, DateTime>? dict, string name)
    {
        if (dict is null) return null;
        return dict.TryGetValue(name, out var dt) ? dt : null;
    }

    private static void Collect(
        Dictionary<string, List<UserStorySprintDto>> byTeam,
        string team,
        string targetName,
        string assignee,
        double hours,
        Guid sprintId,
        DateTime createdAt,
        string storyTitle,
        DateTime? deliveryDateTime)
    {
        if (!assignee.Equals(targetName, StringComparison.OrdinalIgnoreCase) || hours <= 0) return;

        if (!byTeam.TryGetValue(team, out var list))
        {
            list = new List<UserStorySprintDto>();
            byTeam[team] = list;
        }

        list.Add(new UserStorySprintDto(sprintId, createdAt, storyTitle, hours, deliveryDateTime));
    }
}
