namespace Core.Domain.Enums;

public enum AuditActionType
{
    BookingCreated = 1,
    PaymentUpdated = 2,
    BookingReturned = 3,
    BookingPrinted = 4,
    BookingDelivered = 5,
    BookingDeleted = 6
}