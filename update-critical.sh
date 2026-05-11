#!/bin/bash
# Script to automatically inject critical CSS into all HTML files
# Mac/Linux version
# Usage: ./update-critical.sh

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRITICAL_FILE="$DIR/_critical.css"

HTML_FILES=(
    "$DIR/index.html"
    "$DIR/hem/index.html"
    "$DIR/pris/index.html"
    "$DIR/om/index.html"
    "$DIR/kontakt/index.html"
    "$DIR/integritet/index.html"
)

if [ ! -f "$CRITICAL_FILE" ]; then
    echo "ERROR: _critical.css not found!"
    exit 1
fi

CSS_CONTENT=$(cat "$CRITICAL_FILE")

for htmlFile in "${HTML_FILES[@]}"; do
    if [ -f "$htmlFile" ]; then
        perl -i -0pe "s|    <style>.*?    </style>|    <style>\n    ${\(join('\\n    ', split('\\n', $CSS_CONTENT)))\n    </style>|s" "$htmlFile"
        echo "✓ Updated: $htmlFile"
    fi
done

echo ""
echo "Done! All HTML files now have the latest critical CSS."
