using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Books;
using Core.Domain.Entities;
using MediatR;

namespace Core.Application.Features.Books.Queries;

public record GetPrintedInventoryQuery() : IRequest<IReadOnlyList<PrintedBookDto>>;

public class GetPrintedInventoryQueryHandler : IRequestHandler<GetPrintedInventoryQuery, IReadOnlyList<PrintedBookDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetPrintedInventoryQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<PrintedBookDto>> Handle(GetPrintedInventoryQuery request, CancellationToken cancellationToken)
    {
        var repository = _unitOfWork.Repository<Book>();
        var books = await repository.FindAsync(b => b.PortraitStock > 0 || b.LandscapeStock > 0);

        return books
            .OrderBy(b => b.Stage).ThenBy(b => b.Subject)
            .Select(b => new PrintedBookDto(
                b.Id, b.Name, b.Subject, b.Stage, b.Year, b.PortraitStock, b.LandscapeStock))
            .ToList();
    }
}