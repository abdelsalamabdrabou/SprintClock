namespace SprintClock.Domain.Entities;

public record AssigneeHours(string Name, double Hours);

public class UserStory
{
    public string Title { get; init; }
    public IReadOnlyList<AssigneeHours> Frontend { get; init; }
    public IReadOnlyList<AssigneeHours> Backend { get; init; }
    public IReadOnlyList<AssigneeHours> Test { get; init; }

    public UserStory(
        string title,
        IReadOnlyList<AssigneeHours> frontend,
        IReadOnlyList<AssigneeHours> backend,
        IReadOnlyList<AssigneeHours> test)
    {
        Title = title;
        Frontend = frontend;
        Backend = backend;
        Test = test;
    }
}
