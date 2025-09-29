# Stage 1: The Builder
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files from your 'src' directory
COPY src/package.json src/package-lock.json ./

# Install dependencies using ci for reproducible builds
RUN npm ci

# Copy the rest of your source code from the 'src' directory
COPY src/ ./

# Ensure README is available during build if referenced at runtime
COPY README.md ./

# --- CHANGES START HERE ---

# Declare build arguments that will be passed from the CI/CD pipeline.
# These will be used by the Vite build process.
ARG VITE_POSTHOG_KEY
ARG VITE_POSTHOG_HOST

# Build the application, providing the ARGs as environment variables
# to the npm script. Vite will replace import.meta.env variables with these values.
RUN VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY \
    VITE_POSTHOG_HOST=$VITE_POSTHOG_HOST \
    npm run build

# --- CHANGES END HERE ---


# Stage 2: The Production Server
FROM nginx:alpine

# Copy built application from the 'build' stage's /app/dist directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Serve README from web root for terminal fetch
COPY README.md /usr/share/nginx/html/README.md

# Expose port 80
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]