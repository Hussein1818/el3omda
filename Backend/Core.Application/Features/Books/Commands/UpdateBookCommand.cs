using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Books;
using Core.Domain.Entities;
using MediatR;

namespace Core.Application.Features.Books.Commands;

public record UpdateBookCommand(Guid BookId, UpdateBookRequestDto Dto) : IRequest<bool>;

public class UpdateBookCommandHandler : IRequestHandler<UpdateBookCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateBookCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateBookCommand request, CancellationToken cancellationToken)
    {
        var bookRepository = _unitOfWork.Repository<Book>();
        var book = await bookRepository.GetByIdAsync(request.BookId);

        if (book == null)
        {
            throw new KeyNotFoundException($"Book with ID {request.BookId} was not found.");
        }

        book.UpdateDetails(
            request.Dto.Name,
            request.Dto.Subject,
            request.Dto.Stage,
            request.Dto.Year,
            request.Dto.PortraitPrice,
            request.Dto.LandscapePrice
        );

        bookRepository.Update(book);
        await _unitOfWork.CompleteAsync(cancellationToken);

        return true;
    }
}