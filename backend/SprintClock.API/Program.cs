using SprintClock.Application.DTOs;
using SprintClock.Application.Interfaces;
using SprintClock.Application.UseCases;
using SprintClock.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddScoped<IDeliveryCalculator, DeliveryCalculator>();
builder.Services.AddScoped<CalculateDeliveriesUseCase>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.MapPost("/api/calculate", (CalculateRequest request, CalculateDeliveriesUseCase useCase) =>
{
    if (request.Stories == null || request.Stories.Count == 0)
        return Results.BadRequest("At least one user story is required.");

    if (request.Config.MaxDailyHours <= 0)
        return Results.BadRequest("MaxDailyHours must be greater than 0.");

    var response = useCase.Execute(request);
    return Results.Ok(response);
})
.WithName("CalculateDeliveries");

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy" }))
   .WithName("Health");

app.Run();
