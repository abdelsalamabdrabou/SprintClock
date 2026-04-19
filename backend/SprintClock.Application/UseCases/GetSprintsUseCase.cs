using SprintClock.Application.DTOs;
using SprintClock.Application.Interfaces;

namespace SprintClock.Application.UseCases;

public class GetSprintsUseCase
{
    private readonly ISprintRepository _repository;

    public GetSprintsUseCase(ISprintRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<SprintSummaryDto>> ExecuteAsync()
    {
        var snapshots = await _repository.GetAllAsync();
        return snapshots
            .Select(s => new SprintSummaryDto(s.Id, s.CreatedAt, s.FeatureDelivery, s.TotalStories))
            .ToList();
    }
}
