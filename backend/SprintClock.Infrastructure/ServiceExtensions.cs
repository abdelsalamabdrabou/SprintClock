using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SprintClock.Application.Interfaces;
using SprintClock.Infrastructure.Data;
using SprintClock.Infrastructure.Repositories;

namespace SprintClock.Infrastructure;

public static class ServiceExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<SprintClockDbContext>(options =>
            options.UseSqlite(configuration["ConnectionStrings:Default"]));

        services.AddScoped<ISprintRepository, SprintRepository>();

        return services;
    }
}
