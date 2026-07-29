using TradeHub.API.DTOs.Chat;

namespace TradeHub.API.Services.Interfaces;

/// <summary>
/// Defines the contract for the AI chat proxy service.
/// Implementations must NEVER return or log the AI API key.
/// </summary>
public interface IChatService
{
    /// <summary>
    /// Sends a user message (with conversation history) to the AI provider
    /// and returns the assistant's grounded reply.
    /// </summary>
    /// <param name="request">The user's message, conversation ID, and language preference.</param>
    /// <returns>The AI's reply and the echoed conversation ID.</returns>
    Task<ChatMessageResponse> SendMessageAsync(ChatMessageRequest request);
}
