using SprintClock.Domain.Entities;

namespace SprintClock.Application.Interfaces;

public interface IDeliveryCalculator
{
    IReadOnlyList<DeliveryResult> Calculate(SprintConfig config, IReadOnlyList<UserStory> stories);
}
