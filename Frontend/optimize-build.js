const fs = require('fs');
const path = require('path');

console.log('Production Build Optimization Started...');

// Add compression and caching headers to build
const buildIndexPath = path.join(__dirname, 'build', 'index.html');
const packageJsonPath = path.join(__dirname, 'package.json');

// Create .htaccess for Apache servers
const htaccessContent = `# Production optimizations for fitness tracker

# Enable GZIP compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 6 months"
    ExpiresByType image/jpg "access plus 6 months"
    ExpiresByType image/jpeg "access plus 6 months"
    ExpiresByType image/gif "access plus 6 months"
    ExpiresByType image/svg+xml "access plus 6 months"
    ExpiresByType application/font-woff "access plus 6 months"
    ExpiresByType application/font-woff2 "access plus 6 months"
</IfModule>

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# SPA routing
RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]`;

try {
    // Create .htaccess
    fs.writeFileSync(path.join(__dirname, 'build', '.htaccess'), htaccessContent);
    console.log('Created .htaccess for Apache optimization');

    // Update package.json with optimization scripts
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Add optimization scripts
        packageJson.scripts = {
            ...packageJson.scripts,
            "build:analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js",
            "build:prod": "cross-env GENERATE_SOURCEMAP=false npm run build && node optimize-build.js",
            "serve:prod": "npx serve -s build -l 3000"
        };

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('Added optimization scripts to package.json');
    }

    console.log('Production Build Optimization Complete!');
    console.log('Next Steps:');
    console.log('   • Use "npm run build:prod" for optimized production builds');
    console.log('   • Use "npm run serve:prod" to test production build locally');
    console.log('   • Deploy .htaccess with your build for Apache servers');
} catch (error) {
    console.error('Error during optimization:', error);
}