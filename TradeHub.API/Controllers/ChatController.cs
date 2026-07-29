using System.Collections.Concurrent;
using Microsoft.AspNetCore.Mvc;
using TradeHub.API.DTOs;
using TradeHub.API.DTOs.Chat;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Controllers;

/// <summary>
/// POST /api/chat/message — secure AI chat proxy endpoint.
///
/// Security guarantees:
///   • The AI API key is NEVER returned in any response or header.
///   • Per-IP rate limiting (20 requests/minute) prevents abuse.
///   • The endpoint calls the AI via the server-side ChatService only.
/// </summary>
[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    // ── In-memory rate limiter ─────────────────────────────────────────────────
    // Key: IP address string. Value: (request count in current window, window start time).
    // Using a static ConcurrentDictionary so state persists across request instances.
    private static readonly ConcurrentDictionary<string, (int Count, DateTime WindowStart)> _rateLimiter = new();
    private const int    RateLimit      = 20;              // max messages per window
    private static readonly TimeSpan RateWindow = TimeSpan.FromMinutes(1); // window duration

    private readonly IChatService          _chatService;
    private readonly ILogger<ChatController> _logger;

    public ChatController(IChatService chatService, ILogger<ChatController> logger)
    {
        _chatService = chatService;
        _logger      = logger;
    }

    /// <summary>
    /// Accepts a chat message from the frontend widget and returns the AI's reply.
    /// Enforces per-IP rate limiting. The AI API key is NEVER included in the response.
    /// </summary>
    [HttpPost("message")]
    [ProducesResponseType(typeof(ApiResponse<ChatMessageResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PostMessage([FromBody] ChatMessageRequest request)
    {
        // ── Input validation ────────────────────────────────────────────────────
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(ApiResponse.Fail("Message cannot be empty."));

        if (request.Message.Length > 1000)
            return BadRequest(ApiResponse.Fail("Message is too long (max 1000 characters)."));

        // ── Per-IP rate limiting ────────────────────────────────────────────────
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var now = DateTime.UtcNow;

        var current = _rateLimiter.GetOrAdd(ip, _ => (0, now));

        // Reset the window if expired
        if (now - current.WindowStart > RateWindow)
            current = (0, now);

        if (current.Count >= RateLimit)
        {
            _logger.LogWarning("[ChatController] Rate limit exceeded for IP {IP}", ip);

            Response.Headers["Retry-After"] = "60";
            return StatusCode(StatusCodes.Status429TooManyRequests,
                ApiResponse.Fail("Too many requests. Please wait a moment before sending another message."));
        }

        // Increment count
        _rateLimiter[ip] = (current.Count + 1, current.WindowStart);

        // ── Delegate to the AI proxy service ────────────────────────────────────
        try
        {
            var response = await _chatService.SendMessageAsync(request);
            return Ok(ApiResponse<ChatMessageResponse>.Ok(response, "Message processed successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[ChatController] Unexpected error processing chat message.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse.Fail("An unexpected error occurred. Please try again."));
        }
    }
}
