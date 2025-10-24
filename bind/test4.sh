#!/bin/bash

# Check if a symbol was provided
if [ -z "$1" ]; then
  echo "Usage: $0 <STOCK_SYMBOL>"
  exit 1
fi

symbol="$1"
url="https://iboard-query.ssi.com.vn/stock/${symbol}?boardId=MAIN"

echo "🔍 Fetching data for symbol: $symbol"
echo "🌐 Request URL: $url"

# Fetch JSON with User-Agent header
json=$(curl -s -H "User-Agent: Mozilla/5.0" "$url")

# Debug: Show raw JSON length and preview
echo "📦 JSON length: ${#json}"
echo "$json" | head -c 300

# Exit if empty response
if [ -z "$json" ]; then
  echo "⚠️ No data received from SSI API"
  exit 1
fi

# Parse and format output
echo "$json" | awk '
BEGIN {
  FS="[:,{}\"]+"
}
{
  for (i = 1; i <= NF; i++) {
    if ($i ~ /^best[0-9]+Bid$/) {
      level = substr($i, 5, length($i)-7)
      bid[level] = $(i+1)
    }
    if ($i ~ /^best[0-9]+BidVol$/) {
      level = substr($i, 5, length($i)-10)
      bidVol[level] = $(i+1)
    }
    if ($i ~ /^best[0-9]+Offer$/) {
      level = substr($i, 5, length($i)-9)
      offer[level] = $(i+1)
    }
    if ($i ~ /^best[0-9]+OfferVol$/) {
      level = substr($i, 5, length($i)-12)
      offerVol[level] = $(i+1)
    }
  }
}
END {
  printf "%-10s %-10s  %-10s %-10s\n", "Bid", "BidVol", "Offer", "OfferVol"
  for (i = 1; i <= 10; i++) {
    b = (i in bid) ? bid[i] : "—"
    bv = (i in bidVol) ? bidVol[i] : "—"
    o = (i in offer) ? offer[i] : "—"
    ov = (i in offerVol) ? offerVol[i] : "—"
    printf "%-10s %-10s  %-10s %-10s\n", b, bv, o, ov
  }
}
'
