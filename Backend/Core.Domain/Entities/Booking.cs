using System;
using Core.Domain.Common;
using Core.Domain.Enums;

namespace Core.Domain.Entities;

public class Booking : BaseEntity
{
    public string StudentName { get; private set; }=null!;
    public Guid BookId { get; private set; }
    public Book Book { get; private set; }=null!;
    public PrintFormat PrintFormat { get; private set; }
    public decimal PaidAmount { get; private set; }
    public decimal RemainingAmount { get; private set; }
    public bool IsDelivered { get; private set; }
    public DateTime? DeliveryDate { get; private set; }

    private Booking() { }

    public Booking(string studentName, Guid bookId, PrintFormat printFormat, decimal paidAmount, decimal remainingAmount)
    {
        StudentName = studentName;
        BookId = bookId;
        PrintFormat = printFormat;
        PaidAmount = paidAmount;
        RemainingAmount = remainingAmount;
        IsDelivered = false;
    }

    public void MarkAsDelivered()
    {
        IsDelivered = true;
        DeliveryDate = EgyptTimeProvider.Now();
        UpdateTimestamp();
    }
    public void UpdateDetails(string studentName, Guid bookId, PrintFormat printFormat, decimal paidAmount, decimal remainingAmount)
    {
        StudentName = studentName;
        BookId = bookId;
        PrintFormat = printFormat;
        PaidAmount = paidAmount;
        RemainingAmount = remainingAmount;
        UpdateTimestamp();
    }
}