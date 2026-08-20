using System;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Books;
using Core.Domain.Entities;
using MediatR;

namespace Core.Application.Features.Books.Commands;

public record CreateBookCommand(CreateBookRequestDto Dto) : IRequest<Guid>;

public class CreateBookCommandHandler : IRequestHandler<CreateBookCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateBookCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateBookCommand request, CancellationToken cancellationToken)
    {
        var book = new Book(
            request.Dto.Name,
            request.Dto.Subject,
            request.Dto.Stage,
            request.Dto.Year,
            request.Dto.PortraitPrice,
            request.Dto.LandscapePrice
        );

        var bookRepository = _unitOfWork.Repository<Book>();
        await bookRepository.AddAsync(book);

        await _unitOfWork.CompleteAsync(cancellationToken);

        return book.Id;
    }
}