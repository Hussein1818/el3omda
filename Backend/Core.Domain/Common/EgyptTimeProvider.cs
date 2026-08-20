using System;
using System.Runtime.InteropServices;

namespace Core.Domain.Common;

public static class EgyptTimeProvider
{
    public static DateTime Now()
    {
        string timeZoneId = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
            ? "Egypt Standard Time"
            : "Africa/Cairo";

        var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZone);
    }
}