# URL Shortener API

A simple URL shortener built with Node.js, Express, and MongoDB.

## Features:
- Shorten long URLs  
- Retrieve original URLs  
- Update and delete short URLs  
- Track access count  

## API Endpoints:
- `POST /shorten` - Create a short URL  
- `GET /:shortCode` - Retrieve and redirect  
- `GET /shorten/:shortCode/stats` - Get usage stats  
