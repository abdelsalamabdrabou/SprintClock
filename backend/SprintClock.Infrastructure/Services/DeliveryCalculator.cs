using SprintClock.Application.Interfaces;
using SprintClock.Domain.Entities;

namespace SprintClock.Infrastructure.Services;

/// <summary>
/// Calculates delivery datetimes for each team per user story.
/// Rules:
/// - Stories assigned to the same person are queued sequentially (in list order).
/// - Friday (DayOfWeek.Friday) and Saturday are treated as weekend — skipped.
/// - Hours that overflow a workday roll to the next working day at WorkFrom.
/// - Test team starts only after max(FrontendDelivery, BackendDelivery) for that story.
/// </summary>
public class DeliveryCalculator : IDeliveryCalculator
{
    public IReadOnlyList<DeliveryResult> Calculate(SprintConfig config, IReadOnlyList<UserStory> stories)
    {
        // Track the next available start time per assignee per team
        var feQueue = new Dictionary<string, DateTime>(StringComparer.OrdinalIgnoreCase);
        var beQueue = new Dictionary<string, DateTime>(StringComparer.OrdinalIgnoreCase);
        var testQueue = new Dictionary<string, DateTime>(StringComparer.OrdinalIgnoreCase);

        var results = new List<DeliveryResult>();

        foreach (var story in stories)
        {
            DateTime? feDelivery = null;
            DateTime? beDelivery = null;
            DateTime? testDelivery = null;
            var feMemberDeliveries = new Dictionary<string, DateTime>(StringComparer.OrdinalIgnoreCase);
            var beMemberDeliveries = new Dictionary<string, DateTime>(StringComparer.OrdinalIgnoreCase);
            var testMemberDeliveries = new Dictionary<string, DateTime>(StringComparer.OrdinalIgnoreCase);

            // Frontend — each assignee works their own hours; story delivery = last to finish
            if (story.Frontend.Count > 0)
            {
                DateTime latest = DateTime.MinValue;
                foreach (var a in story.Frontend)
                {
                    if (a.Hours <= 0) continue;
                    var start = GetQueueStart(feQueue, a.Name, config);
                    var delivery = AddWorkHours(start, a.Hours, config);
                    feQueue[a.Name] = delivery;
                    feMemberDeliveries[a.Name] = delivery;
                    if (delivery > latest) latest = delivery;
                }
                if (latest > DateTime.MinValue) feDelivery = latest;
            }

            // Backend — each assignee works their own hours; story delivery = last to finish
            if (story.Backend.Count > 0)
            {
                DateTime latest = DateTime.MinValue;
                foreach (var a in story.Backend)
                {
                    if (a.Hours <= 0) continue;
                    var start = GetQueueStart(beQueue, a.Name, config);
                    var delivery = AddWorkHours(start, a.Hours, config);
                    beQueue[a.Name] = delivery;
                    beMemberDeliveries[a.Name] = delivery;
                    if (delivery > latest) latest = delivery;
                }
                if (latest > DateTime.MinValue) beDelivery = latest;
            }

            // Test — starts after max(fe, be); each assignee works their own hours
            if (story.Test.Count > 0)
            {
                var dependencyEnd = MaxNullable(feDelivery, beDelivery);
                DateTime latest = DateTime.MinValue;
                foreach (var a in story.Test)
                {
                    if (a.Hours <= 0) continue;
                    var start = GetQueueStart(testQueue, a.Name, config);
                    if (dependencyEnd.HasValue && dependencyEnd.Value > start)
                        start = AdjustToWorkday(dependencyEnd.Value, config);
                    var delivery = AddWorkHours(start, a.Hours, config);
                    testQueue[a.Name] = delivery;
                    testMemberDeliveries[a.Name] = delivery;
                    if (delivery > latest) latest = delivery;
                }
                if (latest > DateTime.MinValue) testDelivery = latest;
            }

            var deliveries = new[] { feDelivery, beDelivery, testDelivery }
                .Where(d => d.HasValue).ToList();
            var finalDelivery = deliveries.Count > 0
                ? deliveries.Max(d => d!.Value)
                : config.StartDateTime;

            var criticalPath = DetermineCriticalPath(feDelivery, beDelivery, testDelivery, finalDelivery);

            results.Add(new DeliveryResult(
                story.Title,
                feDelivery,
                beDelivery,
                testDelivery,
                finalDelivery,
                criticalPath,
                feMemberDeliveries,
                beMemberDeliveries,
                testMemberDeliveries));
        }

        return results;
    }

    /// <summary>
    /// Gets the next available start for an assignee, defaulting to sprint start.
    /// Ensures the start is within the workday window.
    /// </summary>
    private static DateTime GetQueueStart(
        Dictionary<string, DateTime> queue,
        string assignee,
        SprintConfig config)
    {
        if (!queue.TryGetValue(assignee, out var start))
            start = config.StartDateTime;

        return AdjustToWorkday(start, config);
    }

    /// <summary>
    /// Adds working hours to a start datetime, respecting daily capacity,
    /// workday window, and weekend skipping (Friday + Saturday).
    /// </summary>
    private static DateTime AddWorkHours(DateTime start, double hours, SprintConfig config)
    {
        var current = start;
        var remaining = hours;

        while (remaining > 0)
        {
            current = SkipWeekend(current, config);

            var dayEnd = current.Date.Add(config.WorkUntil.ToTimeSpan());
            var availableToday = (dayEnd - current).TotalHours;
            var effectiveToday = Math.Min(availableToday, config.MaxDailyHours);

            if (effectiveToday <= 0)
            {
                // Move to next working day
                current = NextWorkdayStart(current, config);
                continue;
            }

            if (remaining <= effectiveToday)
            {
                current = current.AddHours(remaining);
                remaining = 0;
            }
            else
            {
                remaining -= effectiveToday;
                current = NextWorkdayStart(current, config);
            }
        }

        return current;
    }

    /// <summary>
    /// Adjusts a datetime so it falls within the workday window on a working day.
    /// If the time is after WorkUntil, moves to the next working day at WorkFrom.
    /// If the time is before WorkFrom, moves to WorkFrom on the same day.
    /// </summary>
    private static DateTime AdjustToWorkday(DateTime dt, SprintConfig config)
    {
        dt = SkipWeekend(dt, config);

        var workFrom = dt.Date.Add(config.WorkFrom.ToTimeSpan());
        var workUntil = dt.Date.Add(config.WorkUntil.ToTimeSpan());

        if (dt < workFrom)
            return workFrom;

        if (dt >= workUntil)
            return NextWorkdayStart(dt, config);

        return dt;
    }

    /// <summary>
    /// Skips Friday (5) and Saturday (6) by advancing to Sunday.
    /// </summary>
    private static DateTime SkipWeekend(DateTime dt, SprintConfig config)
    {
        while (dt.DayOfWeek == DayOfWeek.Friday || dt.DayOfWeek == DayOfWeek.Saturday)
        {
            var daysToAdd = dt.DayOfWeek == DayOfWeek.Friday ? 2 : 1;
            dt = dt.Date.AddDays(daysToAdd).Add(config.WorkFrom.ToTimeSpan());
        }
        return dt;
    }

    private static DateTime NextWorkdayStart(DateTime dt, SprintConfig config)
    {
        var next = dt.Date.AddDays(1).Add(config.WorkFrom.ToTimeSpan());
        return SkipWeekend(next, config);
    }

    private static DateTime Later(DateTime a, DateTime b) => a > b ? a : b;

    private static DateTime? MaxNullable(DateTime? a, DateTime? b)
    {
        if (!a.HasValue) return b;
        if (!b.HasValue) return a;
        return a > b ? a : b;
    }

    private static string DetermineCriticalPath(
        DateTime? fe, DateTime? be, DateTime? test, DateTime final)
    {
        if (test.HasValue && test.Value == final) return "Test";
        if (be.HasValue && be.Value == final) return "Backend";
        if (fe.HasValue && fe.Value == final) return "Frontend";
        return "Unknown";
    }
}
