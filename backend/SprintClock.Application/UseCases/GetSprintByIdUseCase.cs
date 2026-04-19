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

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var response = JsonSerializer.Deserialize<CalculateResponse>(snapshot.ResponseJson, options);
        if (response is null) return null;

        var request = JsonSerializer.Deserialize<CalculateRequest>(snapshot.RequestJson, options);

        return response with { SprintId = snapshot.Id, Config = request?.Config };
    }
}
