using System;
using Core.Domain.Enums;

namespace Core.Application.DTOs.Books;

public record AdjustInventoryRequestDto(
    Guid BookId,
    PrintFormat Format,
    int Quantity,
    bool IsAddition
);