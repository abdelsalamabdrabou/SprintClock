namespace SprintClock.Domain.Entities;

public class UserStory
{
    public string Title { get; init; }
    public string FrontendAssignee { get; init; }
    public string BackendAssignee { get; init; }
    public string TestAssignee { get; init; }
    public double FrontendHours { get; init; }
    public double BackendHours { get; init; }
    public double TestHours { get; init; }

    public UserStory(
        string title,
        string frontendAssignee,
        string backendAssignee,
        string testAssignee,
        double frontendHours,
        double backendHours,
        double testHours)
    {
        Title = title;
        FrontendAssignee = frontendAssignee;
        BackendAssignee = backendAssignee;
        TestAssignee = testAssignee;
        FrontendHours = frontendHours;
        BackendHours = backendHours;
        TestHours = testHours;
    }
}
