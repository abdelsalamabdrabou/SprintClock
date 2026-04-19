using System.Text.Json;
using SprintClock.Application.DTOs;
using SprintClock.Application.Interfaces;

namespace SprintClock.Application.UseCases;

public class GetSprintByIdUseCase
{
    private readonly ISprintRepository _repository;

    public GetSprintByIdUseCase(ISprintRepository repository)
    {
        _repository = repository;
    }

    public async Task<CalculateResponse?> ExecuteAsync(Guid id)
    {
        var snapshot = await _repository.GetByIdAsync(id);
        if (snapshot is null) return null;

        var response = JsonSerializer.Deserialize<CalculateResponse>(snapshot.ResponseJson);
        if (response is null) return null;

        return response with { SprintId = snapshot.Id };
    }
}
