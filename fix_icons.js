const fs = require('fs');
const path = require('path');

// Using forward slashes to avoid escape issues
const src = "C:/Users/IMPACT - DBO/.gemini/antigravity/brain/c6aff2b1-241d-45b6-ae7b-5879fb3d22cb/wedding_icon_512_1770044965286.png";
const destDir = path.resolve(__dirname, 'public', 'icons');

console.log('Source:', src);
console.log('Dest Dir:', destDir);

if (!fs.existsSync(src)) {
    console.error('ERROR: Source file does not exist at ' + src);
    process.exit(1);
}

if (!fs.existsSync(destDir)) {
    console.log('Creating dest dir...');
    fs.mkdirSync(destDir, { recursive: true });
}

try {
    const d1 = path.join(destDir, 'icon-192.png');
    const d2 = path.join(destDir, 'icon-512.png');
    fs.copyFileSync(src, d1);
    fs.copyFileSync(src, d2);
    console.log('SUCCESS: Copied to ' + d1 + ' and ' + d2);
} catch (err) {
    console.error('COPY ERROR:', err.message);
    process.exit(1);
}
