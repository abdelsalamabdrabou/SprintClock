namespace SprintClock.Domain.Entities;

public class DeliveryResult
{
    public string StoryTitle { get; init; }
    public DateTime? FrontendDelivery { get; init; }
    public DateTime? BackendDelivery { get; init; }
    public DateTime? TestDelivery { get; init; }
    public DateTime FinalDelivery { get; init; }
    public string CriticalPathTeam { get; init; }
    public IReadOnlyDictionary<string, DateTime> FrontendMemberDeliveries { get; init; }
    public IReadOnlyDictionary<string, DateTime> BackendMemberDeliveries { get; init; }
    public IReadOnlyDictionary<string, DateTime> TestMemberDeliveries { get; init; }

    public DeliveryResult(
        string storyTitle,
        DateTime? frontendDelivery,
        DateTime? backendDelivery,
        DateTime? testDelivery,
        DateTime finalDelivery,
        string criticalPathTeam,
        IReadOnlyDictionary<string, DateTime> frontendMemberDeliveries,
        IReadOnlyDictionary<string, DateTime> backendMemberDeliveries,
        IReadOnlyDictionary<string, DateTime> testMemberDeliveries)
    {
        StoryTitle = storyTitle;
        FrontendDelivery = frontendDelivery;
        BackendDelivery = backendDelivery;
        TestDelivery = testDelivery;
        FinalDelivery = finalDelivery;
        CriticalPathTeam = criticalPathTeam;
        FrontendMemberDeliveries = frontendMemberDeliveries;
        BackendMemberDeliveries = backendMemberDeliveries;
        TestMemberDeliveries = testMemberDeliveries;
    }
}
