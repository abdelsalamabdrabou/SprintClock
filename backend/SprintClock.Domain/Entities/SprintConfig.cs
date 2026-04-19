namespace SprintClock.Domain.Entities;

public class SprintConfig
{
    public DateTime StartDateTime { get; init; }
    public double MaxDailyHours { get; init; }
    public TimeOnly WorkFrom { get; init; }
    public TimeOnly WorkUntil { get; init; }

    public double WorkdayDurationHours => (WorkUntil - WorkFrom).TotalHours;

    public SprintConfig(DateTime startDateTime, double maxDailyHours, TimeOnly workFrom, TimeOnly workUntil)
    {
        StartDateTime = startDateTime;
        MaxDailyHours = maxDailyHours;
        WorkFrom = workFrom;
        WorkUntil = workUntil;
    }
}
