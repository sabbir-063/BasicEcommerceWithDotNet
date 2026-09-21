FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore BasicCommerce.sln --configfile NuGet.Config
RUN dotnet publish src/BasicCommerce.Api/BasicCommerce.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://0.0.0.0:10000
EXPOSE 10000
ENTRYPOINT ["dotnet", "BasicCommerce.Api.dll"]
