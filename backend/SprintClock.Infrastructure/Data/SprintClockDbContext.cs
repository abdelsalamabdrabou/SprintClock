using Microsoft.EntityFrameworkCore;
using SprintClock.Domain.Entities;

namespace SprintClock.Infrastructure.Data;

public class SprintClockDbContext : DbContext
{
    public DbSet<SprintSnapshot> SprintSnapshots => Set<SprintSnapshot>();

    public SprintClockDbContext(DbContextOptions<SprintClockDbContext> options)
        : base(options) { }
}
