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

        foreach (var snapshot in snapshots)
        {
            var request = JsonSerializer.Deserialize<CalculateRequest>(snapshot.RequestJson);
            if (request is null) continue;

            foreach (var story in request.Stories)
            {
                Collect(byTeam, "Frontend", name, story.FrontendAssignee, story.FrontendHours,
                    snapshot.Id, snapshot.CreatedAt, story.Title);
                Collect(byTeam, "Backend", name, story.BackendAssignee, story.BackendHours,
                    snapshot.Id, snapshot.CreatedAt, story.Title);
                Collect(byTeam, "Test", name, story.TestAssignee, story.TestHours,
                    snapshot.Id, snapshot.CreatedAt, story.Title);
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

    private static void Collect(
        Dictionary<string, List<UserStorySprintDto>> byTeam,
        string team,
        string targetName,
        string assignee,
        double hours,
        Guid sprintId,
        DateTime createdAt,
        string storyTitle)
    {
        if (!assignee.Equals(targetName, StringComparison.OrdinalIgnoreCase) || hours <= 0) return;

        if (!byTeam.TryGetValue(team, out var list))
        {
            list = new List<UserStorySprintDto>();
            byTeam[team] = list;
        }

        list.Add(new UserStorySprintDto(sprintId, createdAt, storyTitle, hours));
    }
}
