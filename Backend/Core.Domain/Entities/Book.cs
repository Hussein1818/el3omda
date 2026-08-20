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

    private Book() { }

    public Book(string name, string subject, EducationalStage stage, AcademicYear year, decimal portraitPrice, decimal landscapePrice)
    {
        Name = name;
        Subject = subject;
        Stage = stage;
        Year = year;
        PortraitPrice = portraitPrice;
        LandscapePrice = landscapePrice;
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
}