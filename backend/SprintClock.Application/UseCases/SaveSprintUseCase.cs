using System.Text.Json;
using SprintClock.Application.DTOs;
using SprintClock.Application.Interfaces;
using SprintClock.Domain.Entities;

namespace SprintClock.Application.UseCases;

public class SaveSprintUseCase
{
    private readonly ISprintRepository _repository;

    public SaveSprintUseCase(ISprintRepository repository)
    {
        _repository = repository;
    }

    public async Task<Guid> ExecuteAsync(CalculateRequest request, CalculateResponse response)
    {
        var snapshot = new SprintSnapshot
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            FeatureDelivery = response.FeatureDelivery,
            TotalStories = response.TotalStories,
            RequestJson = JsonSerializer.Serialize(request),
            ResponseJson = JsonSerializer.Serialize(response),
        };

        await _repository.SaveAsync(snapshot);
        return snapshot.Id;
    }
}
