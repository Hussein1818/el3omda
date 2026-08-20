using System;
using System.Collections.Generic;
using System.Security.Claims;

namespace Core.Application.Contracts;

public interface ITokenService
{
    string GenerateAccessToken(IEnumerable<Claim> claims);
    string GenerateRefreshToken();
}