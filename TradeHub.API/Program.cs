using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TradeHub.API.Data;
using TradeHub.API.Hubs;
using TradeHub.API.Middlewares;
using TradeHub.API.Repositories;
using TradeHub.API.Repositories.Interfaces;
using TradeHub.API.Services;
using TradeHub.API.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// ── 1. Database Context ───────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── 2. Dependency Injection Setup (Layered Architecture) ──────────────────────
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IBrandRepository, BrandRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IBrandService, BrandService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IStockAlertService, StockAlertService>();
builder.Services.AddScoped<IRecommendationService, RecommendationService>();

// ── AI Chat Proxy Services ───────────────────────────────────────────────────
// HttpClient factory — the Groq client gets its base configuration here.
// The API key is injected at request time from configuration (user-secrets in dev,
// environment variable in production) and NEVER exposed to the browser.
builder.Services.AddHttpClient("Groq", client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Singleton conversation store: holds in-memory message history keyed by conversationId.
builder.Services.AddSingleton<ConversationStore>();

// Scoped per request so it can use the scoped AppDbContext.
builder.Services.AddScoped<IChatService, ChatService>();

// ── 3. JWT Authentication ────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key is missing from configuration.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Disable the default claim type mapping so JWT claim names stay as-is.
    // Without this, the middleware silently renames "role" → ClaimTypes.Role (the long URL form),
    // which breaks RoleClaimType = "role" and causes 403 on every [Authorize(Roles = "Admin")] endpoint.
    options.MapInboundClaims = false;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = builder.Configuration["Jwt:Issuer"],
        ValidAudience            = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew                = TimeSpan.Zero,
        RoleClaimType            = "role",      // matches new Claim("role", user.Role) in AuthService
        NameClaimType            = "fullName"   // matches new Claim("fullName", user.FullName)
    };

    // SignalR uses WebSockets which cannot attach Authorization headers.
    // The JS client sends the JWT as ?access_token=... on the hub URL instead.
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// ── 4. CORS Policies ───────────────────────────────────────────────────────────
// "AllowFrontend" — used by all REST endpoints. AllowAnyOrigin is fine here because
// REST calls don't require credentials. This keeps the dev-server flexibility.
//
// "AllowSignalR" — used exclusively by the /hubs/* routes. SignalR's WebSocket
// handshake requires AllowCredentials(), which is mutually exclusive with
// AllowAnyOrigin(). We must name the exact origin(s) explicitly.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });

    options.AddPolicy("AllowSignalR", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:5173",   // Vite default
                  "https://localhost:5173"   // Vite HTTPS (if used)
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();           // Required for SignalR
    });
});

// ── 5. Controllers, SignalR & Swagger ─────────────────────────────────────────
// CustomUserIdProvider maps SignalR connections to authenticated user IDs (from JWT "userId" claim)
// so _hubContext.Clients.User(userId) correctly targets individual user sessions.
builder.Services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();
builder.Services.AddSignalR();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "TradeHub API", Version = "v1" });
    
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Token-i bura daxil edin"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ── API Key presence check (warn loudly on startup if missing) ──────────────
var aiApiKey = builder.Configuration["AiApi:ApiKey"];
if (string.IsNullOrWhiteSpace(aiApiKey))
{
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.WriteLine("[WARNING] AiApi:ApiKey is not configured. The AI chat endpoint (POST /api/chat/message) will return a service-unavailable response.");
    Console.WriteLine("[WARNING] To enable it locally, run: dotnet user-secrets set \"AiApi:ApiKey\" \"sk-ant-YOUR_KEY\"");
    Console.ResetColor();
}
else
{
    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine("[INFO] AiApi:ApiKey is configured. AI chat proxy is enabled.");
    Console.ResetColor();
}

var app = builder.Build();

// ── Startup Seed/Stock Guarantee ──────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        try
        {
            await db.Database.ExecuteSqlRawAsync(
                "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Users]') AND name = 'AvatarUrl') " +
                "ALTER TABLE [Users] ADD [AvatarUrl] nvarchar(500) NULL;");
        }
        catch { /* ignore if already exists or sqlite/in-memory */ }

        var products = await db.Products.ToListAsync();
        bool changed = false;
        foreach (var p in products)
        {
            if (p.StockQuantity < 100)
            {
                p.StockQuantity = 100;
                changed = true;
            }
            if (!p.IsActive)
            {
                p.IsActive = true;
                changed = true;
            }
        }
        if (changed)
        {
            await db.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Startup] Error ensuring product stock: {ex.Message}");
    }
}

// ── Middleware Pipeline ───────────────────────────────────────────────────────
// 1. CORS MUST be the very first middleware so headers are attached to all responses (including errors/redirects)
app.UseCors("AllowFrontend");

// 2. Global Exception Handling
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

// 3. Static Files — serves wwwroot/uploads/products as public URLs (no auth required)
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── SignalR Hub Route ──────────────────────────────────────────────────────────
// Apply the SignalR-specific CORS policy (AllowCredentials) only to this route.
app.MapHub<OrderHub>("/hubs/orders")
   .RequireCors("AllowSignalR");

app.Run();