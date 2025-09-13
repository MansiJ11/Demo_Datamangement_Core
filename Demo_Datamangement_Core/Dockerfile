# Stage 1: Build the app
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Copy project files and restore
COPY *.csproj ./
RUN dotnet restore

# Copy rest of the source and publish
COPY . ./
RUN dotnet publish -c Release -o /app

# Stage 2: Create the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS runtime
WORKDIR /app

# Set the PORT env variable used by Render
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

COPY --from=build /app .

# Replace with your actual DLL name
ENTRYPOINT ["dotnet", "Demo_Datamangement_Core.dll"]
