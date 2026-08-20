using System.Collections.Generic;

namespace Core.Application.DTOs.Common;

public record PaginatedResponseDto<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int PageNumber,
    int PageSize
);