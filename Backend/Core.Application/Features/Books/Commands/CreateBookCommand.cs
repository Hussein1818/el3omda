using System;
using System.Linq;
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
        var bookRepository = _unitOfWork.Repository<Book>();

        var existingBooks = await bookRepository.FindAsync(b =>
            b.Name == request.Dto.Name &&
            b.Subject == request.Dto.Subject &&
            b.Stage == request.Dto.Stage &&
            b.Year == request.Dto.Year);

        var existingBook = existingBooks.FirstOrDefault();

        if (existingBook != null)
        {
            return existingBook.Id;
        }

        var book = new Book(
            request.Dto.Name,
            request.Dto.Subject,
            request.Dto.Stage,
            request.Dto.Year,
            request.Dto.PortraitPrice,
            request.Dto.LandscapePrice
        );

        await bookRepository.AddAsync(book);
        await _unitOfWork.CompleteAsync(cancellationToken);

        return book.Id;
    }
}