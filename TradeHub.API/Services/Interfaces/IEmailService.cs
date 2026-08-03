namespace TradeHub.API.Services.Interfaces;

/// <summary>
/// Defines a contract for sending application emails (order confirmations, etc.).
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends an HTML email to the specified recipient.
    /// </summary>
    /// <param name="toEmail">Recipient email address.</param>
    /// <param name="toName">Recipient display name.</param>
    /// <param name="subject">Email subject line.</param>
    /// <param name="htmlBody">Full HTML body of the email.</param>
    Task SendAsync(string toEmail, string toName, string subject, string htmlBody);

    /// <summary>
    /// Sends a pre-built order confirmation email to the customer.
    /// </summary>
    Task SendOrderConfirmationAsync(
        string toEmail,
        string toName,
        int orderId,
        decimal totalPrice,
        IEnumerable<(string ProductName, int Quantity, decimal UnitPrice)> items);

    /// <summary>
    /// Sends a price drop notification email to the customer when a wishlisted product price decreases.
    /// </summary>
    Task SendPriceDropEmailAsync(
        string toEmail,
        string toName,
        string productName,
        decimal oldPrice,
        decimal newPrice);
}
