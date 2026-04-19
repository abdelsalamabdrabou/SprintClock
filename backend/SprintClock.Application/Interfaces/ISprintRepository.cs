using SprintClock.Domain.Entities;

namespace SprintClock.Application.Interfaces;

public interface ISprintRepository
{
    Task SaveAsync(SprintSnapshot snapshot);
    Task<IReadOnlyList<SprintSnapshot>> GetAllAsync();
    Task<SprintSnapshot?> GetByIdAsync(Guid id);
    Task<bool> DeleteAsync(Guid id);
}
