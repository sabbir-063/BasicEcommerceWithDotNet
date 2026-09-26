using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using BasicCommerce.Infrastructure;
using Npgsql;

namespace BasicCommerce.IntegrationTests;

public sealed class IntegrationApplication : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly string _schema = $"bc_it_{Guid.NewGuid():N}";
    private string _adminConnection = "";
    private string _applicationConnection = "";

    public HttpClient Client { get; private set; } = null!;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Default"] = _applicationConnection,
                ["Jwt:Secret"] = "integration-test-secret-that-is-at-least-32-characters",
                ["Jwt:Issuer"] = "BasicCommerce.IntegrationTests",
                ["Jwt:Audience"] = "BasicCommerce.IntegrationTests.Client",
                ["Jwt:AccessTokenMinutes"] = "10",
                ["Cors:AllowedOrigins:0"] = "http://localhost:5173",
                ["Cloudinary:CloudName"] = "integration-test",
                ["Cloudinary:ApiKey"] = "integration-test",
                ["Cloudinary:ApiSecret"] = "integration-test",
                ["Cloudinary:Folder"] = "integration-test"
            });
        });
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.AddDbContext<AppDbContext>(options => options.UseNpgsql(_applicationConnection));
        });
    }

    public async Task InitializeAsync()
    {
        _adminConnection = LoadTestConnection();
        await using (var connection = new NpgsqlConnection(_adminConnection))
        {
            await connection.OpenAsync();
            await using var command = new NpgsqlCommand($"CREATE SCHEMA \"{_schema}\"", connection);
            await command.ExecuteNonQueryAsync();
        }

        var applicationBuilder = new NpgsqlConnectionStringBuilder(_adminConnection)
        {
            SearchPath = _schema,
            Options = $"-c search_path={_schema}",
            IncludeErrorDetail = false
        };
        _applicationConnection = applicationBuilder.ConnectionString;
        await using (var connection = new NpgsqlConnection(_applicationConnection))
        {
            await connection.OpenAsync();
            await using var command = new NpgsqlCommand("SELECT current_schema(), current_setting('search_path'), EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = @schema)", connection);
            command.Parameters.AddWithValue("schema", _schema);
            await using var reader = await command.ExecuteReaderAsync();
            await reader.ReadAsync();
            var currentSchema = reader.IsDBNull(0) ? null : reader.GetString(0);
            var searchPath = reader.GetString(1);
            var schemaExists = reader.GetBoolean(2);
            if (currentSchema != _schema)
                throw new InvalidOperationException($"The integration connection did not select its private schema (current={currentSchema ?? "null"}, searchPath={searchPath}, configured={applicationBuilder.SearchPath}, parsed={new NpgsqlConnectionStringBuilder(_applicationConnection).SearchPath}, exists={schemaExists}).");
        }
        Client = CreateClient();

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var activeSearchPath = new NpgsqlConnectionStringBuilder(db.Database.GetConnectionString()).SearchPath;
        if (activeSearchPath != _schema)
            throw new InvalidOperationException("The API did not use the private integration-test schema.");
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        Client?.Dispose();
        await DisposeAsync();

        await using var connection = new NpgsqlConnection(_adminConnection);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand($"DROP SCHEMA IF EXISTS \"{_schema}\" CASCADE", connection);
        await command.ExecuteNonQueryAsync();
    }

    private static string LoadTestConnection()
    {
        var configured = Environment.GetEnvironmentVariable("BASICCOMMERCE_TEST_CONNECTION");
        if (!string.IsNullOrWhiteSpace(configured)) return NormalizeConnection(configured);

        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "BasicCommerce.sln")))
            directory = directory.Parent;

        var infoPath = directory?.Parent is null ? null : Path.Combine(directory.Parent.FullName, "info.txt");
        if (infoPath is null || !File.Exists(infoPath))
            throw new InvalidOperationException(
                "Set BASICCOMMERCE_TEST_CONNECTION or provide the ignored root info.txt before running integration tests.");

        var values = File.ReadLines(infoPath)
            .Select(ParseEnvironmentLine)
            .Where(pair => pair is not null)
            .ToDictionary(pair => pair!.Value.Key, pair => pair!.Value.Value, StringComparer.OrdinalIgnoreCase);

        if (values.TryGetValue("NEON_DATABASE_URL_DIRECT", out var direct) && !string.IsNullOrWhiteSpace(direct))
            return NormalizeConnection(direct);

        throw new InvalidOperationException("NEON_DATABASE_URL_DIRECT is missing from the ignored root info.txt.");
    }

    private static string NormalizeConnection(string value)
    {
        if (!value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
            !value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
            return value;

        var uri = new Uri(value);
        var credentials = uri.UserInfo.Split(':', 2);
        if (credentials.Length != 2)
            throw new InvalidOperationException("The direct PostgreSQL URL has no username or password.");

        return new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/')),
            Username = Uri.UnescapeDataString(credentials[0]),
            Password = Uri.UnescapeDataString(credentials[1]),
            SslMode = SslMode.Require,
            IncludeErrorDetail = false
        }.ConnectionString;
    }

    private static KeyValuePair<string, string>? ParseEnvironmentLine(string rawLine)
    {
        var line = rawLine.Trim();
        if (line.Length == 0 || line.StartsWith('#')) return null;

        var separator = line.IndexOf('=');
        if (separator <= 0) return null;

        var key = line[..separator].Trim();
        var value = line[(separator + 1)..].Trim();
        if (value.Length >= 2 &&
            ((value[0] == '"' && value[^1] == '"') || (value[0] == '\'' && value[^1] == '\'')))
            value = value[1..^1];

        return KeyValuePair.Create(key, value);
    }
}
