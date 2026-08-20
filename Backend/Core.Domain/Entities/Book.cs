using Core.Domain.Common;
using Core.Domain.Enums;

namespace Core.Domain.Entities;

public class Book : BaseEntity
{
    public string Name { get; private set; } = null!;
    public string Subject { get; private set; } = null!;
    public EducationalStage Stage { get; private set; }
    public AcademicYear Year { get; private set; }
    public decimal PortraitPrice { get; private set; }
    public decimal LandscapePrice { get; private set; }

    public int PortraitStock { get; private set; }
    public int LandscapeStock { get; private set; }

    private Book() { }

    public Book(string name, string subject, EducationalStage stage, AcademicYear year, decimal portraitPrice, decimal landscapePrice)
    {
        Name = name;
        Subject = subject;
        Stage = stage;
        Year = year;
        PortraitPrice = portraitPrice;
        LandscapePrice = landscapePrice;
        PortraitStock = 0;
        LandscapeStock = 0;
    }

    public void UpdateDetails(string name, string subject, EducationalStage stage, AcademicYear year, decimal portraitPrice, decimal landscapePrice)
    {
        Name = name;
        Subject = subject;
        Stage = stage;
        Year = year;
        PortraitPrice = portraitPrice;
        LandscapePrice = landscapePrice;
        UpdateTimestamp();
    }

    public void AddStock(PrintFormat format, int quantity)
    {
        if (format == PrintFormat.Portrait) PortraitStock += quantity;
        else LandscapeStock += quantity;
        UpdateTimestamp();
    }

    public void RemoveStock(PrintFormat format, int quantity)
    {
        if (format == PrintFormat.Portrait)
        {
            PortraitStock -= quantity;
            if (PortraitStock < 0) PortraitStock = 0;
        }
        else
        {
            LandscapeStock -= quantity;
            if (LandscapeStock < 0) LandscapeStock = 0;
        }
        UpdateTimestamp();
    }
}