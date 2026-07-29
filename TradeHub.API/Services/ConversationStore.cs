using System.Collections.Concurrent;

namespace TradeHub.API.Services;

/// <summary>
/// Represents a single turn in a conversation (one user message + one AI reply).
/// </summary>
public record ConversationTurn(string Role, string Content);

/// <summary>
/// Thread-safe in-memory store for conversation histories, keyed by conversationId (GUID string).
/// Registered as a Singleton so the same dictionary lives for the application lifetime.
/// Conversations expire automatically after 30 minutes of inactivity.
/// </summary>
public sealed class ConversationStore
{
    // Max turns to keep per conversation (each turn = 1 user message OR 1 AI reply)
    private const int MaxTurnsPerConversation = 20; // = 10 back-and-forth exchanges

    // Inactivity expiry window
    private static readonly TimeSpan ExpiryWindow = TimeSpan.FromMinutes(30);

    private record ConversationEntry(List<ConversationTurn> Turns, DateTime LastAccessed);

    private readonly ConcurrentDictionary<string, ConversationEntry> _store = new();

    /// <summary>
    /// Returns the stored turns for a given conversation ID (may be empty for new sessions).
    /// Creates an empty entry if none exists.
    /// </summary>
    public IReadOnlyList<ConversationTurn> GetHistory(string conversationId)
    {
        if (string.IsNullOrWhiteSpace(conversationId)) return [];

        if (_store.TryGetValue(conversationId, out var entry))
        {
            // Refresh last-accessed timestamp
            _store[conversationId] = entry with { LastAccessed = DateTime.UtcNow };
            return entry.Turns;
        }

        return [];
    }

    /// <summary>
    /// Appends a user message and the AI reply to the conversation history.
    /// Trims to the last MaxTurnsPerConversation entries to bound memory usage.
    /// </summary>
    public void Append(string conversationId, string userMessage, string aiReply)
    {
        if (string.IsNullOrWhiteSpace(conversationId)) return;

        var entry = _store.GetOrAdd(conversationId,
            _ => new ConversationEntry([], DateTime.UtcNow));

        lock (entry.Turns)
        {
            entry.Turns.Add(new ConversationTurn("user", userMessage));
            entry.Turns.Add(new ConversationTurn("assistant", aiReply));

            // Trim oldest turns if over limit
            while (entry.Turns.Count > MaxTurnsPerConversation)
                entry.Turns.RemoveAt(0);
        }

        _store[conversationId] = entry with { LastAccessed = DateTime.UtcNow };
    }

    /// <summary>
    /// Purges conversation entries that have been inactive beyond the expiry window.
    /// Call periodically (e.g. from a background service or a request-scoped cleanup).
    /// </summary>
    public void PurgeExpired()
    {
        var cutoff = DateTime.UtcNow - ExpiryWindow;
        var expired = _store
            .Where(kv => kv.Value.LastAccessed < cutoff)
            .Select(kv => kv.Key)
            .ToList();

        foreach (var key in expired)
            _store.TryRemove(key, out _);
    }
}
