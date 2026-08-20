using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Books;
using Core.Domain.Entities;
using Core.Domain.Enums;
using MediatR;

namespace Core.Application.Features.Books.Commands;

public record AdjustInventoryStockCommand(AdjustInventoryRequestDto Dto) : IRequest<bool>;

public class AdjustInventoryStockCommandHandler : IRequestHandler<AdjustInventoryStockCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public AdjustInventoryStockCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(AdjustInventoryStockCommand request, CancellationToken cancellationToken)
    {
        var bookRepo = _unitOfWork.Repository<Book>();
        var book = await bookRepo.GetByIdAsync(request.Dto.BookId);

        if (book == null)
            throw new KeyNotFoundException($"Book with ID {request.Dto.BookId} was not found.");

        if (request.Dto.IsAddition)
        {
            book.AddStock(request.Dto.Format, request.Dto.Quantity);
        }
        else
        {
            book.RemoveStock(request.Dto.Format, request.Dto.Quantity);
        }

        bookRepo.Update(book);

        string actionType = request.Dto.IsAddition ? "Added" : "Removed";
        var auditLog = new AuditLog(
            AuditActionType.BookingPrinted,
            nameof(Book),
            book.Id,
            null,
            $"Manual Inventory Adjustment: {actionType} {request.Dto.Quantity} copies of {request.Dto.Format} format for {book.Name}"
        );

        await _unitOfWork.Repository<AuditLog>().AddAsync(auditLog);
        await _unitOfWork.CompleteAsync(cancellationToken);

        return true;
    }
}