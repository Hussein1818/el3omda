using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Core.Application.Contracts;

public interface IGenericRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<T>> GetAllAsync();
   
    Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, params string[] includes);
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
    Task<(IReadOnlyList<T> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, Expression<Func<T, bool>>? predicate = null);
}