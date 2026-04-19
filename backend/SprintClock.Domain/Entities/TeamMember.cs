namespace SprintClock.Domain.Entities;

public class TeamMember
{
    public string Name { get; init; }
    public TeamType Team { get; init; }

    public TeamMember(string name, TeamType team)
    {
        Name = name;
        Team = team;
    }
}
