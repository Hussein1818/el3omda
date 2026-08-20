using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Application.Contracts;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<TEntity> Repository<TEntity>() where TEntity : class;
    Task<int> CompleteAsync(CancellationToken cancellationToken = default);
}