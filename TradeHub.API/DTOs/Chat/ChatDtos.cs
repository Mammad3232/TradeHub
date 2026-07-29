namespace TradeHub.API.DTOs.Chat;

/// <summary>
/// Request body sent by the frontend chat widget to POST /api/chat/message.
/// The API key is NEVER included here — it lives server-side only.
/// </summary>
public class ChatMessageRequest
{
    /// <summary>The user's chat message text.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Optional GUID that groups messages into a conversation session.
    /// Generated client-side on widget mount; empty string treated as a new session.
    /// </summary>
    public string ConversationId { get; set; } = string.Empty;

    /// <summary>
    /// BCP-47 language code (e.g. "en", "az", "tr", "ru") from the frontend i18n state.
    /// Used to instruct the AI to respond in the user's selected language.
    /// </summary>
    public string Language { get; set; } = "en";
}

/// <summary>
/// Response returned to the frontend. Contains only the AI's reply and session ID.
/// No API keys, no internal system prompts, no raw AI metadata are exposed.
/// </summary>
public class ChatMessageResponse
{
    /// <summary>The AI assistant's reply text.</summary>
    public string Reply { get; set; } = string.Empty;

    /// <summary>The conversation ID echoed back so the client can send it on future messages.</summary>
    public string ConversationId { get; set; } = string.Empty;
}
