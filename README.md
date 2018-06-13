# TVmaze Scraper

**Live Demo**: [https://tvmaze-scraper.azurewebsites.net/](https://tvmaze-scraper.azurewebsites.net/)

The main purpose of this repository is to show a simple application that scrapes the TVMaze API for show and cast information, persists the data in storage, and provides the scraped data using a REST API.

# Pre-requisites
To build and run this app locally you will need a few things:
- Install [Node.js](https://nodejs.org/en/)
- Install [Docker](https://www.docker.com/community-edition)

# Getting started
- Clone the repository
```
git clone https://github.com/eduardomourar/tvmaze-scraper
```
- Install dependencies
```
cd tvmaze-scraper
npm install
```
- Start your Redis server using Docker Compose
```
docker-compose up -d
```
- Setup sytem environment variables (if different than default)
```bash
REDISCACHEHOSTNAME=127.0.0.1
REDISCACHEPORT=6379
REDISCACHEKEY=<KEY>
```
- Build and run the project
```
npm run build
npm start
```
Or, `npm run watch` for development mode.

Finally, navigate to `http://localhost:3000` and you should see the initial message!

# Usage

The REST API has the following business requirements:
1. It should provide a paginated list of all tv shows containing the id of the TV show and a list of all the cast that are playing in that TV show.
2. The list of the cast must be ordered by birthday descending.

## Endpoints
### GET scraper
```
/scraper
```
Update local storage with shows and cast information from TVmazer.

### GET shows
```
/shows?page=:page&size=:size
```
Provide list of TV shows ordered (as per requeriment), where:
- `page`: the page to be presented (default value is **1**)
- `size`: how many results per page (default value is **250**)

Example

```
https://tvmaze-scraper.azurewebsites.net/shows?page=3&size=50
```

# Deploying the app
Azure cloud platform was used for the application deployment to production environment.

## Services
- [**Azure App Service for Windows**](https://azure.microsoft.com/en-us/services/app-service/)
- [**Azure Redis Cache**](https://azure.microsoft.com/en-gb/services/cache/)
