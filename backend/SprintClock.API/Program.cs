using SprintClock.Application.DTOs;
using SprintClock.Application.Interfaces;
using SprintClock.Application.UseCases;
using SprintClock.Infrastructure;
using SprintClock.Infrastructure.Data;
using SprintClock.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddScoped<IDeliveryCalculator, DeliveryCalculator>();
builder.Services.AddScoped<CalculateDeliveriesUseCase>();

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<SaveSprintUseCase>();
builder.Services.AddScoped<GetSprintsUseCase>();
builder.Services.AddScoped<GetSprintByIdUseCase>();
builder.Services.AddScoped<GetUserStatsUseCase>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SprintClockDbContext>();
    db.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.MapPost("/api/calculate", async (CalculateRequest request, CalculateDeliveriesUseCase useCase, SaveSprintUseCase saveUseCase) =>
{
    if (request.Stories == null || request.Stories.Count == 0)
        return Results.BadRequest("At least one user story is required.");

    if (request.Config.MaxDailyHours <= 0)
        return Results.BadRequest("MaxDailyHours must be greater than 0.");

    var response = useCase.Execute(request);
    var sprintId = await saveUseCase.ExecuteAsync(request, response);
    return Results.Ok(response with { SprintId = sprintId });
})
.WithName("CalculateDeliveries");

app.MapGet("/api/sprints", async (GetSprintsUseCase useCase) =>
{
    var sprints = await useCase.ExecuteAsync();
    return Results.Ok(sprints);
})
.WithName("GetSprints");

app.MapGet("/api/sprints/{id:guid}", async (Guid id, GetSprintByIdUseCase useCase) =>
{
    var sprint = await useCase.ExecuteAsync(id);
    return sprint is null ? Results.NotFound() : Results.Ok(sprint);
})
.WithName("GetSprintById");

app.MapDelete("/api/sprints/{id:guid}", async (Guid id, ISprintRepository repo) =>
{
    var deleted = await repo.DeleteAsync(id);
    return deleted ? Results.NoContent() : Results.NotFound();
})
.WithName("DeleteSprint");

app.MapGet("/api/users/{name}/stats", async (string name, GetUserStatsUseCase useCase) =>
{
    var stats = await useCase.ExecuteAsync(name);
    return Results.Ok(stats);
})
.WithName("GetUserStats");

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy" }))
   .WithName("Health");

app.Run();
