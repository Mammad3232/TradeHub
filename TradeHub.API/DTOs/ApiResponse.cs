namespace TradeHub.API.DTOs;

/// <summary>
/// Standard envelope for all API responses.
/// Format: { "success": true, "message": "...", "data": { ... } }
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Success") =>
        new() { Success = true, Message = message, Data = data };

    public static ApiResponse<T> Fail(string message) =>
        new() { Success = false, Message = message };
}

/// <summary>Non-generic variant for simple success/fail without data payload.</summary>
public class ApiResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public object? Errors { get; set; }

    public static ApiResponse Ok(string message = "Success") =>
        new() { Success = true, Message = message };

    public static ApiResponse Fail(string message, object? errors = null) =>
        new() { Success = false, Message = message, Errors = errors };
}
