using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Books;
using Core.Domain.Entities;
using MediatR;

namespace Core.Application.Features.Books.Queries;

public record GetAllBooksQuery() : IRequest<IReadOnlyList<BookResponseDto>>;

public class GetAllBooksQueryHandler : IRequestHandler<GetAllBooksQuery, IReadOnlyList<BookResponseDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllBooksQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<BookResponseDto>> Handle(GetAllBooksQuery request, CancellationToken cancellationToken)
    {
        var bookRepository = _unitOfWork.Repository<Book>();
        var books = await bookRepository.GetAllAsync();

        return books.Select(b => new BookResponseDto(
            b.Id,
            b.Name,
            b.Subject,
            b.Stage,
            b.Year,
            b.PortraitPrice,
            b.LandscapePrice
        )).ToList();
    }
}