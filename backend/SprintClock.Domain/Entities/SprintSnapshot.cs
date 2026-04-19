namespace SprintClock.Domain.Entities;

public class SprintSnapshot
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime FeatureDelivery { get; set; }
    public int TotalStories { get; set; }
    /// <summary>Serialized CalculateRequest JSON (PascalCase, System.Text.Json defaults).</summary>
    public string RequestJson { get; set; } = string.Empty;
    /// <summary>Serialized CalculateResponse JSON (PascalCase, System.Text.Json defaults).</summary>
    public string ResponseJson { get; set; } = string.Empty;
}
