# Overview

This is a French public holidays web scraper application that extracts data from calendrier-365.fr. The application scrapes public holiday information for specified years and serves it through an Express.js REST API. It's designed to be deployed on serverless platforms like Vercel, providing calendar data for French holidays including dates, names, day of week, and days remaining until each holiday.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture

**Web Scraping Service**
- Uses Cheerio for HTML parsing to extract structured data from external calendar website
- Implements Axios with custom User-Agent headers to perform HTTP requests and handle external website scraping
- Scrapes table data from calendrier-365.fr, parsing rows to extract holiday information (date, name, day, days remaining)
- Error handling included for network failures and parsing issues

**API Server**
- Express.js web server running on configurable port (defaults to 5000)
- RESTful API with three main endpoints:
  - `GET /` - Returns monthly calendars (January-December) with Monday-Friday structure
  - `GET /recherche?calendrier=YEAR` - Returns French public holidays for specified year
  - `GET /calendriers/:annee` - Returns both calendars and holidays combined
- Designed for serverless deployment with Vercel configuration

## Data Structure

The application processes holiday data into structured objects containing:
- `date`: Text representation of the holiday date
- `nom`: Name of the French public holiday
- `jour`: Day of the week
- `joursRestants`: Number of days remaining until the holiday (parsed as integer)

## Deployment Architecture

**Serverless Configuration**
- Configured for Vercel deployment using @vercel/node builder
- All routes directed to single entry point (index.js)
- Environment-aware port configuration for local and cloud environments

**Rationale**: Serverless deployment eliminates server management overhead and provides automatic scaling for this lightweight scraping service. The stateless nature of web scraping operations makes it ideal for serverless functions.

# External Dependencies

## Third-Party Libraries

**axios (v1.13.2)**
- HTTP client for making requests to the calendar website
- Provides robust error handling and request configuration
- Used with custom headers to mimic browser requests

**cheerio (v1.1.2)**
- Server-side jQuery implementation for HTML parsing
- Enables DOM traversal and manipulation of scraped HTML content
- Lightweight alternative to headless browsers for static content scraping

**express (v4.22.1)**
- Web application framework for Node.js
- Handles HTTP routing and middleware
- Provides the REST API interface for the application

## External Services

**calendrier-365.fr**
- Source website for French public holiday data
- Data accessed via HTML scraping from URL pattern: `https://www.calendrier-365.fr/jours-feries/{year}.html`
- Dependency risk: Changes to website structure will break the scraper

## Deployment Platform

**Vercel**
- Serverless hosting platform for Node.js applications
- Automatic HTTPS, CDN, and scaling capabilities
- Configuration defined in vercel.json