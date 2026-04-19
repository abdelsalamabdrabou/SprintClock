using Microsoft.EntityFrameworkCore;
using SprintClock.Application.Interfaces;
using SprintClock.Domain.Entities;
using SprintClock.Infrastructure.Data;

namespace SprintClock.Infrastructure.Repositories;

public class SprintRepository : ISprintRepository
{
    private readonly SprintClockDbContext _db;

    public SprintRepository(SprintClockDbContext db)
    {
        _db = db;
    }

    public async Task SaveAsync(SprintSnapshot snapshot)
    {
        _db.SprintSnapshots.Add(snapshot);
        await _db.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<SprintSnapshot>> GetAllAsync()
    {
        return await _db.SprintSnapshots
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task<SprintSnapshot?> GetByIdAsync(Guid id)
    {
        return await _db.SprintSnapshots.FindAsync(id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var snapshot = await _db.SprintSnapshots.FindAsync(id);
        if (snapshot is null) return false;
        _db.SprintSnapshots.Remove(snapshot);
        await _db.SaveChangesAsync();
        return true;
    }
}
