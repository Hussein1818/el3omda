using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Domain.Entities;
using MediatR;

namespace Core.Application.Features.Books.Commands;

public record DeleteBookCommand(Guid BookId) : IRequest<bool>;

public class DeleteBookCommandHandler : IRequestHandler<DeleteBookCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteBookCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteBookCommand request, CancellationToken cancellationToken)
    {
        var bookRepository = _unitOfWork.Repository<Book>();
        var book = await bookRepository.GetByIdAsync(request.BookId);

        if (book == null)
        {
            throw new KeyNotFoundException($"Book with ID {request.BookId} was not found.");
        }

        bookRepository.Delete(book);
        await _unitOfWork.CompleteAsync(cancellationToken);

        return true;
    }
}