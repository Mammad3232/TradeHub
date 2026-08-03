using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Services;

/// <summary>
/// Sends emails via SMTP using MailKit. SMTP settings are read from appsettings.json under "EmailSettings".
/// In development, configure Mailtrap for safe, inbox-free testing.
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    // ── Core Send Method ──────────────────────────────────────────────────────────

    public async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        var settings = _config.GetSection("EmailSettings");

        // Build the MIME message
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(
            settings["SenderName"] ?? "TradeHub",
            settings["SenderEmail"] ?? "noreply@tradehub.store"));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
        message.Body = bodyBuilder.ToMessageBody();

        // Connect and send
        using var client = new SmtpClient();
        try
        {
            var host   = settings["Host"]     ?? "sandbox.smtp.mailtrap.io";
            var port   = int.Parse(settings["Port"] ?? "587");
            var user   = settings["Username"] ?? "";
            var pass   = settings["Password"] ?? "";

            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(user, pass);
            await client.SendAsync(message);

            _logger.LogInformation("Email sent successfully to {Email} | Subject: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            // Log but do NOT throw — a failed email should never crash the order flow
            _logger.LogError(ex, "Failed to send email to {Email}. Order will still be processed.", toEmail);
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }

    // ── Order Confirmation Email ──────────────────────────────────────────────────

    public async Task SendOrderConfirmationAsync(
        string toEmail,
        string toName,
        int orderId,
        decimal totalPrice,
        IEnumerable<(string ProductName, int Quantity, decimal UnitPrice)> items)
    {
        var subject = $"✅ TradeHub — Order #{orderId} Confirmed!";
        var htmlBody = BuildOrderConfirmationHtml(toName, orderId, totalPrice, items);
        await SendAsync(toEmail, toName, subject, htmlBody);
    }

    // ── HTML Template Builder ─────────────────────────────────────────────────────

    private static string BuildOrderConfirmationHtml(
        string customerName,
        int orderId,
        decimal totalPrice,
        IEnumerable<(string ProductName, int Quantity, decimal UnitPrice)> items)
    {
        // Build item rows
        var rows = string.Join("", items.Select(i => $"""
            <tr>
                <td style="padding:10px 16px; border-bottom:1px solid #1e293b; color:#e2e8f0;">{i.ProductName}</td>
                <td style="padding:10px 16px; border-bottom:1px solid #1e293b; color:#94a3b8; text-align:center;">{i.Quantity}</td>
                <td style="padding:10px 16px; border-bottom:1px solid #1e293b; color:#a78bfa; text-align:right;">${i.UnitPrice:F2}</td>
            </tr>
        """));

        return $"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Order Confirmation</title>
        </head>
        <body style="margin:0; padding:0; background-color:#0f172a; font-family:'Segoe UI', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a; padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b; border-radius:16px; overflow:hidden; border:1px solid #334155;">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding:36px 40px; text-align:center;">
                      <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:800; letter-spacing:-0.5px;">🛍️ TradeHub</h1>
                      <p style="margin:8px 0 0; color:#c4b5fd; font-size:15px;">Your order is confirmed!</p>
                    </td>
                  </tr>

                  <!-- Greeting -->
                  <tr>
                    <td style="padding:32px 40px 0;">
                      <h2 style="margin:0 0 8px; color:#f8fafc; font-size:20px;">Hi, {customerName}! 👋</h2>
                      <p style="margin:0; color:#94a3b8; font-size:15px; line-height:1.6;">
                        Thank you for your purchase. We've received your order and it's now being processed.
                        You'll receive another update when your items ship.
                      </p>
                    </td>
                  </tr>

                  <!-- Order Badge -->
                  <tr>
                    <td style="padding:24px 40px;">
                      <div style="background-color:#0f172a; border-radius:12px; padding:16px 24px; display:inline-block; border:1px solid #334155;">
                        <span style="color:#64748b; font-size:12px; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Order Number</span><br/>
                        <span style="color:#a78bfa; font-size:24px; font-weight:800;">#{orderId}</span>
                      </div>
                    </td>
                  </tr>

                  <!-- Order Items Table -->
                  <tr>
                    <td style="padding:0 40px 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px; overflow:hidden; border:1px solid #1e293b;">
                        <thead>
                          <tr style="background-color:#0f172a;">
                            <th style="padding:12px 16px; text-align:left; color:#64748b; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px;">Product</th>
                            <th style="padding:12px 16px; text-align:center; color:#64748b; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px;">Qty</th>
                            <th style="padding:12px 16px; text-align:right; color:#64748b; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px;">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows}
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <!-- Total -->
                  <tr>
                    <td style="padding:0 40px 32px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background: linear-gradient(135deg, #7c3aed22, #4f46e522); border-radius:12px; padding:20px 24px; border:1px solid #7c3aed44;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="color:#94a3b8; font-size:14px;">Total Amount</td>
                                <td style="color:#a78bfa; font-size:24px; font-weight:800; text-align:right;">${totalPrice:F2}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color:#0f172a; padding:24px 40px; text-align:center; border-top:1px solid #1e293b;">
                      <p style="margin:0 0 8px; color:#475569; font-size:13px;">Questions? Contact us at <a href="mailto:support@tradehub.store" style="color:#7c3aed; text-decoration:none;">support@tradehub.store</a></p>
                      <p style="margin:0; color:#334155; font-size:12px;">© 2026 TradeHub. All rights reserved.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """;
    }

    // ── Price Drop Email ──────────────────────────────────────────────────────────

    public async Task SendPriceDropEmailAsync(
        string toEmail,
        string toName,
        string productName,
        decimal oldPrice,
        decimal newPrice)
    {
        var subject = $"🎉 Price Drop Alert! {productName} is now ${newPrice:F2}!";
        var htmlBody = BuildPriceDropHtml(toName, productName, oldPrice, newPrice);
        await SendAsync(toEmail, toName, subject, htmlBody);
    }

    private static string BuildPriceDropHtml(
        string customerName,
        string productName,
        decimal oldPrice,
        decimal newPrice)
    {
        var savings = oldPrice - newPrice;

        return $"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Price Drop Alert</title>
        </head>
        <body style="margin:0; padding:0; background-color:#0f172a; font-family:'Segoe UI', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a; padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b; border-radius:16px; overflow:hidden; border:1px solid #334155;">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981, #059669); padding:36px 40px; text-align:center;">
                      <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:800; letter-spacing:-0.5px;">🎉 Price Drop Alert!</h1>
                      <p style="margin:8px 0 0; color:#a7f3d0; font-size:15px;">An item on your wishlist just dropped in price!</p>
                    </td>
                  </tr>

                  <!-- Greeting & Product -->
                  <tr>
                    <td style="padding:32px 40px 0;">
                      <h2 style="margin:0 0 8px; color:#f8fafc; font-size:20px;">Hi, {customerName}! 👋</h2>
                      <p style="margin:0 0 20px; color:#94a3b8; font-size:15px; line-height:1.6;">
                        Great news! A product you saved to your wishlist is now available at a lower price:
                      </p>
                      <h3 style="margin:0 0 16px; color:#34d399; font-size:22px; font-weight:700;">{productName}</h3>
                    </td>
                  </tr>

                  <!-- Price Badge -->
                  <tr>
                    <td style="padding:0 40px 32px;">
                      <div style="background-color:#0f172a; border-radius:12px; padding:20px 24px; border:1px solid #10b98144;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="color:#94a3b8; font-size:14px;">Previous Price:</td>
                            <td style="color:#94a3b8; font-size:16px; text-decoration:line-through; text-align:right;">${oldPrice:F2}</td>
                          </tr>
                          <tr>
                            <td style="color:#34d399; font-size:18px; font-weight:800; padding-top:8px;">New Low Price:</td>
                            <td style="color:#34d399; font-size:26px; font-weight:900; text-align:right; padding-top:8px;">${newPrice:F2}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding-top:12px; border-top:1px solid #334155; text-align:center; color:#a7f3d0; font-weight:700; font-size:14px;">
                              🔥 You save ${savings:F2}!
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>

                  <!-- CTA Footer -->
                  <tr>
                    <td style="background-color:#0f172a; padding:24px 40px; text-align:center; border-top:1px solid #1e293b;">
                      <p style="margin:0 0 8px; color:#475569; font-size:13px;">Visit <a href="http://localhost:5173/wishlist" style="color:#10b981; text-decoration:none; font-weight:700;">TradeHub Wishlist</a> to grab it before stock runs out!</p>
                      <p style="margin:0; color:#334155; font-size:12px;">© 2026 TradeHub. All rights reserved.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """;
    }
}
